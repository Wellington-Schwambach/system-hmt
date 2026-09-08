import type { LogisticsFormData } from './types';

export interface LogisticsValidationFeedback {
  title: string;
  message: string;
}

const MAX_CONTAINER_WEIGHT = 999_999_999.99;

function hasInvalidWeight(value: string): boolean {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return false;

  const parsed = Number(normalized);
  return !Number.isFinite(parsed) || parsed < 0 || parsed > MAX_CONTAINER_WEIGHT;
}

/**
 * Valida somente regras que precisam de resposta imediata na tela.
 * O backend continua sendo a fonte final de validação e repete as regras críticas.
 */
export function validateLogisticsForm(form: LogisticsFormData): LogisticsValidationFeedback | null {
  if (!form.shipperId) {
    return {
      title: 'Embarcador obrigatório',
      message: 'Selecione o embarcador da carga.',
    };
  }

  if (form.stage === 'PROGRAMMING' && !form.collectionScheduledAt) {
    return {
      title: 'Agendamento da coleta',
      message: 'Informe a data em “Agendar coleta”.',
    };
  }

  if (form.plateMode === 'THIRD_PARTY' && !form.thirdPartyTractorPlate.trim()) {
    return {
      title: 'Placa do terceiro',
      message: 'Informe a placa principal do terceiro. A carreta continua opcional.',
    };
  }

  // CARGA não depende de Load. Esta regra só existe quando LOAD foi selecionado.
  if (form.loadMode === 'LOAD' && form.loadEntries.length === 0) {
    return {
      title: 'Load obrigatória',
      message: 'Adicione ao menos uma Load e informe se ela está vazia ou cheia.',
    };
  }

  if (!form.driverId && form.driverTwoId) {
    return {
      title: 'Primeiro motorista obrigatório',
      message: 'Selecione o primeiro motorista antes de informar o segundo.',
    };
  }

  if (form.driverId && form.driverId === form.driverTwoId) {
    return {
      title: 'Motoristas duplicados',
      message: 'O segundo motorista deve ser diferente do primeiro.',
    };
  }

  if (hasInvalidWeight(form.containerTareKg)) {
    return {
      title: 'Tara inválida',
      message: 'Informe a tara do container com um valor numérico maior ou igual a zero.',
    };
  }

  if (hasInvalidWeight(form.containerPayloadKg)) {
    return {
      title: 'Payload inválido',
      message: 'Informe o payload do container com um valor numérico maior ou igual a zero.',
    };
  }

  return null;
}
