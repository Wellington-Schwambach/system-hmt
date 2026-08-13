import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

import { DateInput } from '../../../../components/DateInput';
import { ENTRY_LABELS, INITIAL_FINANCIAL_ENTRY_FORM } from '../../constants';
import type { FinancialEntryFormData } from '../../types';
import type { EntryModalProps } from './types';
import {
  Actions,
  Button,
  CloseButton,
  Error,
  Field,
  Form,
  Header,
  Input,
  Label,
  Modal,
  Overlay,
  Subtitle,
  Title,
} from './styles';

export function EntryModal({ isOpen, type, onClose, onSubmit }: EntryModalProps) {
  const [formData, setFormData] = useState<FinancialEntryFormData>(INITIAL_FINANCIAL_ENTRY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const label = ENTRY_LABELS[type];

  function handleChange(field: keyof FinancialEntryFormData, value: string) {
    setFormData((currentData) => ({ ...currentData, [field]: value }));
    setError('');
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit(formData)) {
      setError('Informe um valor maior que zero.');
      return;
    }

    onClose();
  }

  return (
    <Overlay role="presentation" onMouseDown={onClose}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Header>
          <div>
            <Title id="entry-modal-title">Adicionar {label.toLocaleLowerCase('pt-BR')}</Title>
            <Subtitle>O lançamento será somado automaticamente no acerto.</Subtitle>
          </div>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar modal">
            <X size={18} aria-hidden="true" />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="entry-date">Data</Label>
            <DateInput
              id="entry-date"
              value={formData.date}
              onValueChange={(value) => handleChange('date', value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="entry-description">Descrição</Label>
            <Input
              id="entry-description"
              type="text"
              value={formData.description}
              onChange={(event) => handleChange('description', event.target.value)}
              placeholder={`Ex.: ${label} referente ao período`}
              autoComplete="off"
            />
          </Field>

          <Field>
            <Label htmlFor="entry-value">Valor</Label>
            <Input
              id="entry-value"
              type="text"
              inputMode="decimal"
              value={formData.value}
              onChange={(event) => handleChange('value', event.target.value)}
              placeholder="0,00"
              required
            />
          </Field>

          {error && <Error role="alert">{error}</Error>}

          <Actions>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $primary>
              <Save size={16} aria-hidden="true" />
              Adicionar
            </Button>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
}
