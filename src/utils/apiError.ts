import axios from 'axios';

interface BackendErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string[] | string>;
}

export interface ApiErrorFeedback {
  title: string;
  message: string;
  details: string[];
  status?: number;
}

const STATUS_MESSAGES: Record<number, { title: string; message: string }> = {
  400: { title: 'Solicitação inválida', message: 'Confira os dados enviados e tente novamente.' },
  401: { title: 'Autenticação necessária', message: 'Entre novamente para continuar.' },
  403: { title: 'Acesso não permitido', message: 'Seu usuário não possui permissão para esta operação.' },
  404: { title: 'Registro não encontrado', message: 'O item pode ter sido removido ou alterado.' },
  409: { title: 'Conflito de dados', message: 'Já existe um registro com essas informações.' },
  413: {
    title: 'Arquivos muito grandes',
    message: 'O envio ultrapassou o limite permitido. Reduza o tamanho dos anexos e tente novamente.',
  },
  419: { title: 'Sessão de segurança expirada', message: 'Atualize a página ou entre novamente.' },
  422: { title: 'Revise os dados informados', message: 'Alguns campos precisam de correção.' },
  423: { title: 'Acesso temporariamente restrito', message: 'Consulte sua regra de acesso ou fale com um administrador.' },
  429: { title: 'Muitas tentativas', message: 'Aguarde um momento antes de tentar novamente.' },
  500: { title: 'Erro interno no servidor', message: 'A operação não pôde ser concluída agora.' },
  503: { title: 'Serviço indisponível', message: 'O servidor está temporariamente indisponível.' },
};

const FIELD_LABELS: Record<string, string> = {
  name: 'nome',
  username: 'usuário',
  phone: 'telefone',
  is_active: 'status',
  role: 'perfil de acesso',
  password: 'senha',
  password_confirmation: 'confirmação da senha',
  current_password: 'senha atual',
  theme_preference: 'tema',
  menu_permissions: 'permissões de acesso',
  access_schedule_enabled: 'regra de horário',
  access_start_time: 'horário inicial da semana',
  access_end_time: 'horário final da semana',
  access_days: 'dias permitidos',
  saturday_start_time: 'horário inicial de sábado',
  saturday_end_time: 'horário final de sábado',
  sunday_start_time: 'horário inicial de domingo',
  sunday_end_time: 'horário final de domingo',
  access_timezone: 'fuso horário',
  duration_minutes: 'tempo de liberação',
  ip_address: 'endereço IP',

  employee_code: 'matrícula',
  full_name: 'nome do colaborador',
  cpf: 'CPF',
  rg: 'RG',
  birth_date: 'data de nascimento',
  email: 'e-mail',
  full_address: 'endereço completo',
  job_title: 'cargo',
  admission_date: 'data de admissão',
  termination_date: 'data de rescisão',
  family_contact: 'contato familiar',
  probation_end_date: 'fim da experiência',
  status: 'status',
  cnh_number: 'número da CNH',
  cnh_category: 'categoria da CNH',
  cnh_issued_at: 'data de emissão da CNH',
  cnh_first_license_date: 'data da primeira habilitação',
  cnh_expiry_date: 'vencimento da CNH',
  cnh_state: 'UF da CNH',
  cnh_security_code: 'código de segurança da CNH',
  aso_expiry_date: 'vencimento do ASO',
  opentech_expiry_date: 'vencimento Opentech',
  angellira_expiry_date: 'vencimento Angellira',
  toxicological_expiry_date: 'vencimento toxicológico',
  trainings: 'treinamentos',
  notes: 'observações',
  cnh_file: 'anexo da CNH',
  aso_file: 'anexo do ASO',
  toxicological_file: 'anexo toxicológico',
  registration_form_file: 'ficha de registro',

  fleet_number: 'número da frota',
  plate: 'placa',
  type: 'tipo do veículo',
  brand: 'marca',
  model: 'modelo',
  manufacture_year: 'ano de fabricação',
  model_year: 'ano do modelo',
  color: 'cor',
  chassis: 'chassi',
  renavam: 'RENAVAM',
  fuel_type: 'combustível',
  load_capacity_kg: 'capacidade de carga',
  tare_kg: 'tara',
  current_km: 'KM atual',
  licensing_expiry_date: 'licenciamento',
  crlv: 'CRLV',
  crlv_valid_until: 'vigência do CRLV',

  cte_type: 'tipo do CT-e',
  travel_date: 'data da viagem',
  receipt_date: 'data de recebimento',
  origin: 'origem',
  destination: 'destino',
  cte_number: 'número do CT-e',
  cte_series: 'série do CT-e',
  shipper: 'embarcador',
  operation_type: 'responsável pela viagem',
  vehicle_id: 'cavalo / placa',
  driver_one_id: 'motorista',
  driver_two_id: 'segundo motorista',
  third_party_name: 'terceiro contratado',
  third_party_plate: 'placa do terceiro',
  third_party_payout_amount: 'valor de repasse',
  detached_trailer_id: 'carreta do desengate',
  net_freight: 'frete líquido',
  insurance_amount: 'seguro',
  toll_amount: 'pedágio',
  icms_amount: 'ICMS',
  bonus_amount: 'bonificação',
};

const FILE_FIELDS = new Set([
  'cnh_file',
  'aso_file',
  'toxicological_file',
  'registration_form_file',
  'crlv',
]);

function normalizeField(field: string): string {
  return field
    .split('.')
    .filter((part) => !/^\d+$/.test(part))
    .join('.')
    .replace(/\.\*$/, '');
}

function fieldLabel(field: string): string {
  const normalized = normalizeField(field);
  return FIELD_LABELS[normalized] ?? normalized.replaceAll('_', ' ');
}

function fileUploadMessage(field: string): string {
  const label = fieldLabel(field);
  return `Não foi possível enviar ${label}. Use PDF, JPG ou PNG de até 10 MB e tente novamente.`;
}

function translateValidationKey(message: string, field: string): string | null {
  if (!message.startsWith('validation.')) return null;

  const label = fieldLabel(field);
  const normalizedField = normalizeField(field);
  const key = message.toLowerCase();

  if (key.includes('uploaded')) return fileUploadMessage(field);
  if (key.includes('mimes') || key.includes('mimetypes') || key.includes('extensions')) {
    return FILE_FIELDS.has(normalizedField)
      ? `${label.charAt(0).toUpperCase()}${label.slice(1)} deve ser um arquivo PDF, JPG ou PNG.`
      : `O formato informado em ${label} não é permitido.`;
  }
  if (key.includes('.file')) return `${label.charAt(0).toUpperCase()}${label.slice(1)} não foi reconhecido como um arquivo válido.`;
  if (key.includes('required')) return `O campo ${label} é obrigatório.`;
  if (key.includes('unique')) return `O valor informado em ${label} já está cadastrado.`;
  if (key.includes('email')) return `Informe um e-mail válido no campo ${label}.`;
  if (key.includes('date')) return `Informe uma data válida no campo ${label}.`;
  if (key.includes('integer') || key.includes('numeric')) return `Informe um número válido no campo ${label}.`;
  if (key.includes('boolean')) return `O valor informado no campo ${label} é inválido.`;
  if (key.includes('in') || key.includes('enum')) return `O valor selecionado para ${label} é inválido.`;
  if (key.includes('regex')) return `O formato informado no campo ${label} é inválido.`;
  if (key.includes('confirmed')) return `A confirmação do campo ${label} não confere.`;
  if (key.includes('current_password')) return 'A senha atual informada não confere.';
  if (key.includes('max') && FILE_FIELDS.has(normalizedField)) return `${label.charAt(0).toUpperCase()}${label.slice(1)} deve possuir no máximo 10 MB.`;
  if (key.includes('max')) return `O valor informado no campo ${label} ultrapassa o limite permitido.`;
  if (key.includes('min')) return `O valor informado no campo ${label} está abaixo do mínimo permitido.`;
  if (key.includes('size')) return `O tamanho ou quantidade de caracteres do campo ${label} é inválido.`;
  if (key.includes('between')) return `O valor informado no campo ${label} está fora do intervalo permitido.`;

  return `Há um problema no campo ${label}. Revise o valor informado.`;
}

function translateCommonEnglishMessage(message: string, field: string): string | null {
  const label = fieldLabel(field);
  const lower = message.toLowerCase();

  if (lower.includes('failed to upload')) return fileUploadMessage(field);
  if (lower.includes('must be a file of type') || lower.includes('must be a file of the type')) {
    return `${label.charAt(0).toUpperCase()}${label.slice(1)} deve ser um arquivo PDF, JPG ou PNG.`;
  }
  if (lower.includes('must not be greater than') && FILE_FIELDS.has(normalizeField(field))) {
    return `${label.charAt(0).toUpperCase()}${label.slice(1)} deve possuir no máximo 10 MB.`;
  }
  if (lower.includes('field is required')) return `O campo ${label} é obrigatório.`;
  if (lower.includes('has already been taken')) return `O valor informado em ${label} já está cadastrado.`;
  if (lower.includes('selected') && lower.includes('is invalid')) return `O valor selecionado para ${label} é inválido.`;
  if (lower.includes('must be a valid email')) return `Informe um e-mail válido no campo ${label}.`;

  return null;
}

function isTechnicalMessage(message: string): boolean {
  return [
    /sqlstate/i,
    /stack trace/i,
    /illuminate\\/i,
    /symfony\\/i,
    /vendor\//i,
    /vendor\\/i,
    /undefined (variable|array key|property)/i,
    /call to undefined/i,
    /trying to access/i,
    /csrf token mismatch/i,
    /unauthenticated\.?$/i,
    /<!doctype/i,
    /<html/i,
  ].some((pattern) => pattern.test(message));
}

function sanitizeValidationMessage(message: string, field: string): string | null {
  const trimmed = message.trim();
  if (!trimmed) return null;

  const translatedKey = translateValidationKey(trimmed, field);
  if (translatedKey) return translatedKey;

  const translatedEnglish = translateCommonEnglishMessage(trimmed, field);
  if (translatedEnglish) return translatedEnglish;

  if (isTechnicalMessage(trimmed)) return null;
  return trimmed;
}

function flattenErrors(errors?: BackendErrorBody['errors']): string[] {
  if (!errors) return [];

  const details = Object.entries(errors).flatMap(([field, value]) => {
    const messages = Array.isArray(value) ? value : [value];
    return messages
      .map((message) => sanitizeValidationMessage(message, field))
      .filter((message): message is string => Boolean(message));
  });

  return [...new Set(details)].slice(0, 8);
}

function sanitizeBackendMessage(message?: string): string | null {
  const trimmed = message?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('validation.')) {
    return 'Os dados enviados possuem uma informação inválida. Revise os campos destacados.';
  }

  if (/the given data was invalid/i.test(trimmed)) {
    return 'Alguns campos precisam de correção.';
  }

  if (isTechnicalMessage(trimmed)) return null;
  return trimmed;
}

export function getApiErrorFeedback(
  error: unknown,
  fallbackMessage = 'Não foi possível concluir a operação.',
): ApiErrorFeedback {
  if (!axios.isAxiosError<BackendErrorBody>(error)) {
    return {
      title: 'Algo não saiu como esperado',
      message: fallbackMessage,
      details: [],
    };
  }

  if (!error.response) {
    return {
      title: 'Servidor indisponível',
      message: 'Não foi possível conectar ao backend. Verifique se o servidor está em execução.',
      details: [],
    };
  }

  const status = error.response.status;
  const backend = error.response.data;
  const defaults = STATUS_MESSAGES[status] ?? {
    title: 'Operação não concluída',
    message: fallbackMessage,
  };
  const details = flattenErrors(backend?.errors);
  const backendMessage = sanitizeBackendMessage(backend?.message);

  // Nunca exibe exceções/SQL/stack trace do servidor para o usuário final.
  if (status >= 500) {
    return {
      title: defaults.title,
      message: defaults.message || fallbackMessage,
      details: [],
      status,
    };
  }

  return {
    title: defaults.title,
    message:
      status === 422 && details.length > 0
        ? defaults.message
        : backendMessage || defaults.message || fallbackMessage,
    details,
    status,
  };
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  const feedback = getApiErrorFeedback(error, fallbackMessage);
  return feedback.details[0] ?? feedback.message;
}
