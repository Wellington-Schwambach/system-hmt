import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  AllButton,
  Checkbox,
  ClearButton,
  Dropdown,
  Empty,
  OptionButton,
  OptionList,
  SearchBox,
  SearchIcon,
  SearchInput,
  Shell,
  Summary,
  Trigger,
} from './styles';

export interface CheckboxMultiSelectOption {
  value: string;
  label: string;
  searchText?: string;
}

interface CheckboxMultiSelectProps {
  value: string[];
  options: CheckboxMultiSelectOption[];
  allLabel: string;
  placeholder?: string;
  searchPlaceholder?: string;
  ariaLabel: string;
  onChange: (value: string[]) => void;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

export function CheckboxMultiSelect({
  value,
  options,
  allLabel,
  placeholder = 'Selecione',
  searchPlaceholder = 'Pesquisar...',
  ariaLabel,
  onChange,
}: CheckboxMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const allSelected = value.length === 0;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const filteredOptions = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return options;

    return options.filter((option) =>
      normalize(`${option.label} ${option.searchText ?? ''}`).includes(term),
    );
  }, [options, search]);

  const summary = useMemo(() => {
    if (allSelected) return allLabel;
    if (value.length === 1) {
      return options.find((option) => option.value === value[0])?.label ?? placeholder;
    }
    return `${value.length} selecionados`;
  }, [allLabel, allSelected, options, placeholder, value]);

  const toggleOption = (optionValue: string) => {
    if (allSelected) {
      onChange([optionValue]);
      return;
    }

    if (value.includes(optionValue)) {
      const next = value.filter((item) => item !== optionValue);
      onChange(next.length === 0 ? [] : next);
      return;
    }

    const next = [...value, optionValue];
    onChange(next.length >= options.length ? [] : next);
  };

  return (
    <Shell ref={rootRef}>
      <Trigger
        type="button"
        $open={open}
        onClick={() => setOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Summary title={summary}>{summary}</Summary>
        <ChevronDown size={16} aria-hidden="true" />
      </Trigger>

      {open ? (
        <Dropdown>
          <SearchBox>
            <SearchIcon><Search size={15} /></SearchIcon>
            <SearchInput
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
            />
            {search ? (
              <ClearButton type="button" onClick={() => setSearch('')} aria-label="Limpar pesquisa">
                <X size={14} />
              </ClearButton>
            ) : null}
          </SearchBox>

          <AllButton type="button" onClick={() => onChange([])} $checked={allSelected}>
            <Checkbox $checked={allSelected}>{allSelected ? <Check size={13} /> : null}</Checkbox>
            <span>{allLabel}</span>
          </AllButton>

          <OptionList role="listbox" aria-multiselectable="true">
            {filteredOptions.length === 0 ? (
              <Empty>Nenhum resultado encontrado.</Empty>
            ) : (
              filteredOptions.map((option) => {
                const checked = allSelected || value.includes(option.value);
                return (
                  <OptionButton
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggleOption(option.value)}
                  >
                    <Checkbox $checked={checked}>{checked ? <Check size={13} /> : null}</Checkbox>
                    <span>{option.label}</span>
                  </OptionButton>
                );
              })
            )}
          </OptionList>
        </Dropdown>
      ) : null}
    </Shell>
  );
}
