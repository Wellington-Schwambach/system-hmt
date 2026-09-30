import type { ValeFormData } from './types';

const MAX_AMOUNT = 9_999_999_999.99;

export function parseValeMoney(value: string): number {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function hasIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function hasIsoMonth(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value);
}

function hasLocalDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
}

export function validateValeForm(form: ValeFormData, options?: { editing?: boolean }): string[] {
  const errors: string[] = [];
  const editing = options?.editing ?? false;
  const amount = parseValeMoney(form.amount);
  const installments = Number(form.installments);

  if (!form.employeeId || !/^\d+$/.test(form.employeeId) || Number(form.employeeId) <= 0) {
    errors.push('Selecione o motorista.');
  }

  if (!form.discountStartMonth || !hasIsoMonth(form.discountStartMonth)) {
    errors.push('Informe o mês em que começa o desconto da 1ª parcela.');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push(form.category === 'LOAN' ? 'Informe um valor de parcela maior que zero.' : form.category === 'FINE' ? 'Informe um valor à cobrar maior que zero.' : 'Informe um valor maior que zero.');
  } else if (amount > MAX_AMOUNT) {
    errors.push('O valor informado ultrapassa o limite permitido pelo sistema.');
  }

  if (!editing && (!Number.isInteger(installments) || installments < 1 || installments > 60)) {
    errors.push('Informe entre 1 e 60 parcelas.');
  }

  if (!editing && form.category !== 'LOAN' && Number.isFinite(amount) && amount > 0 && Number.isInteger(installments) && installments > 0) {
    const amountCents = Math.round(amount * 100);
    if (amountCents < installments) {
      errors.push('O valor total é muito baixo para a quantidade de parcelas. Cada parcela precisa ter pelo menos R$ 0,01.');
    }
  }

  if ((form.category === 'ADVANCE' || form.category === 'OTHER_DISCOUNT') && !hasIsoDate(form.date)) {
    errors.push('Informe uma data válida para o lançamento.');
  }

  if (form.description.trim().length > 255) {
    errors.push('A descrição/observação pode ter no máximo 255 caracteres.');
  }

  if (form.category === 'FINE') {
    const originalAmount = parseValeMoney(form.fineOriginalAmount);

    if (!hasLocalDateTime(form.fineInfractionAt)) {
      errors.push('Informe a data e a hora da infração.');
    }
    if (!form.finePlate.trim()) {
      errors.push('Selecione a placa da multa.');
    } else if (form.finePlate.trim().length > 20) {
      errors.push('A placa da multa ultrapassa o tamanho permitido.');
    }
    if (!form.fineLocation.trim()) {
      errors.push('Selecione o local/cidade da infração.');
    } else if (form.fineLocation.trim().length > 255) {
      errors.push('O local da infração pode ter no máximo 255 caracteres.');
    }
    if (!form.fineNumber.trim()) {
      errors.push('Informe o Nº Auto / Nº Multa.');
    } else if (form.fineNumber.trim().length > 100) {
      errors.push('O Nº Auto / Nº Multa pode ter no máximo 100 caracteres.');
    }
    if (!form.description.trim()) {
      errors.push('Informe a descrição da multa.');
    }
    if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
      errors.push('Informe um valor original da multa maior que zero.');
    } else if (originalAmount > MAX_AMOUNT) {
      errors.push('O valor original da multa ultrapassa o limite permitido pelo sistema.');
    }
  }

  return [...new Set(errors)];
}
