import type { LogisticsFormData } from './types';

export interface LogisticsValidationFeedback {
  title: string;
  message: string;
}

/**
 * No cadastro de cargas, somente o embarcador é obrigatório.
 * Os demais campos são opcionais; quando preenchidos, os próprios controles
 * e o backend continuam normalizando/validando o formato suportado.
 */
export function validateLogisticsForm(form: LogisticsFormData): LogisticsValidationFeedback | null {
  if (!form.shipperId) {
    return {
      title: 'Embarcador obrigatório',
      message: 'Selecione o embarcador da carga.',
    };
  }

  return null;
}
