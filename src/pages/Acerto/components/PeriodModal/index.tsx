import { useEffect, useState } from 'react';
import { CalendarCheck, X } from 'lucide-react';

import { DateInput } from '../../../../components/DateInput';
import type { PeriodModalProps } from './types';
import {
  Actions,
  Button,
  CloseButton,
  Error,
  Field,
  Form,
  Header,
  Label,
  Modal,
  Overlay,
  Subtitle,
  Title,
} from './styles';

export function PeriodModal({
  isOpen,
  initialStartDate,
  initialEndDate,
  onClose,
  onApply,
}: PeriodModalProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
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
  }, [initialEndDate, initialStartDate, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startDate || !endDate) {
      setError('Informe as datas inicial e final.');
      return;
    }

    if (startDate > endDate) {
      setError('A data inicial não pode ser maior que a data final.');
      return;
    }

    onApply(startDate, endDate);
    onClose();
  }

  return (
    <Overlay role="presentation" onMouseDown={onClose}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="period-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Header>
          <div>
            <Title id="period-modal-title">Período personalizado</Title>
            <Subtitle>Escolha um intervalo específico para buscar as viagens.</Subtitle>
          </div>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar modal">
            <X size={18} aria-hidden="true" />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="period-start-date">Data inicial</Label>
            <DateInput
              id="period-start-date"
              value={startDate}
              onValueChange={(value) => {
                setStartDate(value);
                setError('');
              }}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="period-end-date">Data final</Label>
            <DateInput
              id="period-end-date"
              value={endDate}
              onValueChange={(value) => {
                setEndDate(value);
                setError('');
              }}
              required
            />
          </Field>

          {error && <Error role="alert">{error}</Error>}

          <Actions>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $primary>
              <CalendarCheck size={16} aria-hidden="true" />
              Aplicar período
            </Button>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
}
