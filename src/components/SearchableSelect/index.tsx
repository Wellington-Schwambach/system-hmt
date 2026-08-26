import { Check, ChevronDown, LoaderCircle, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import {
  Chevron,
  Control,
  Dropdown,
  EmptyState,
  IconButton,
  OptionButton,
  OptionsList,
  ResultsMeta,
  Root,
  SearchIconBox,
  SearchInput,
  SelectedMark,
} from './styles';
import type { SearchableSelectOption, SearchableSelectProps } from './types';

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function matchesSearch(option: SearchableSelectOption, query: string): boolean {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;

  const searchableValue = normalizeSearch(`${option.label} ${option.searchText ?? ''}`);
  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => searchableValue.includes(token));
}

export function SearchableSelect({
  id,
  value,
  options,
  onChange,
  placeholder = 'Selecione uma opção',
  searchPlaceholder = 'Digite para pesquisar...',
  emptyMessage = 'Nenhum resultado encontrado.',
  disabled = false,
  loading = false,
  clearable = true,
  ariaLabel,
}: SearchableSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(
    () => options.filter((option) => matchesSearch(option, query)),
    [options, query],
  );

  const visibleOptions = useMemo(() => filteredOptions.slice(0, 100), [filteredOptions]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  function openDropdown() {
    if (disabled || loading) return;
    setIsOpen(true);
    setQuery('');
    setActiveIndex(0);
  }

  function selectOption(option: SearchableSelectOption) {
    onChange(option.value);
    setIsOpen(false);
    setQuery('');
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      setIsOpen(false);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled || loading) return;

    if (!isOpen && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
      event.preventDefault();
      openDropdown();
      return;
    }

    if (!isOpen) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) =>
        visibleOptions.length === 0 ? 0 : Math.min(current + 1, visibleOptions.length - 1),
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(Math.max(visibleOptions.length - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = visibleOptions[safeActiveIndex];
      if (option) selectOption(option);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setQuery('');
    }
  }

  const visibleValue = isOpen ? query : selectedOption?.label ?? '';
  const safeActiveIndex = Math.min(activeIndex, Math.max(visibleOptions.length - 1, 0));
  const activeOption = visibleOptions[safeActiveIndex];

  return (
    <Root ref={rootRef}>
      <Control
        $open={isOpen}
        $disabled={disabled || loading}
        onClick={() => inputRef.current?.focus()}
      >
        <SearchIconBox aria-hidden="true">
          {loading ? <LoaderCircle size={16} className="select-loading-icon" /> : <Search size={16} />}
        </SearchIconBox>

        <SearchInput
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeOption ? `${listboxId}-${activeIndex}` : undefined}
          disabled={disabled || loading}
          value={visibleValue}
          placeholder={isOpen ? searchPlaceholder : placeholder}
          onFocus={openDropdown}
          onChange={(event) => {
            if (!isOpen) setIsOpen(true);
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />

        {clearable && value && !disabled && !loading ? (
          <IconButton
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange('');
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Limpar seleção"
            title="Limpar seleção"
          >
            <X size={15} />
          </IconButton>
        ) : null}

        <IconButton
          type="button"
          disabled={disabled || loading}
          onClick={(event) => {
            event.stopPropagation();
            if (isOpen) {
              setIsOpen(false);
              setQuery('');
            } else {
              inputRef.current?.focus();
              openDropdown();
            }
          }}
          aria-label={isOpen ? 'Fechar opções' : 'Abrir opções'}
          title={isOpen ? 'Fechar opções' : 'Abrir opções'}
        >
          <Chevron $open={isOpen}>
            <ChevronDown size={16} />
          </Chevron>
        </IconButton>
      </Control>

      {isOpen ? (
        <Dropdown>
          <ResultsMeta>
            <span>{query ? `Busca: “${query}”` : 'Comece a digitar para filtrar'}</span>
            <span>{filteredOptions.length > 100 ? `100 de ${filteredOptions.length}` : `${filteredOptions.length} resultado(s)`}</span>
          </ResultsMeta>

          <OptionsList id={listboxId} role="listbox" aria-label={ariaLabel ?? placeholder}>
            {visibleOptions.length === 0 ? (
              <EmptyState>{emptyMessage}</EmptyState>
            ) : (
              visibleOptions.map((option, index) => {
                const selected = option.value === value;
                return (
                  <OptionButton
                    key={option.value}
                    id={`${listboxId}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    $active={safeActiveIndex === index}
                    $selected={selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                  >
                    <span>{option.label}</span>
                    {selected ? (
                      <SelectedMark aria-hidden="true">
                        <Check size={15} strokeWidth={2.4} />
                      </SelectedMark>
                    ) : null}
                  </OptionButton>
                );
              })
            )}
          </OptionsList>
        </Dropdown>
      ) : null}
    </Root>
  );
}
