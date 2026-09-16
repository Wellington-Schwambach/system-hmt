import {
  Ban,
  BellRing,
  Eye,
  EyeOff,
  History,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/Auth/useAuth';
import { useNotifications } from '../../contexts/Notifications';
import {
  securityService,
  type AccessProfile,
  type PermissionCatalogItem,
  type CustomDailyAlert,
  type DailyNotePreferenceSetting,
  type SaveUserPayload,
  type SecurityOverview,
  type SecurityUser,
} from '../../services/securityService';
import { getApiErrorFeedback } from '../../utils/apiError';
import {
  BlockActionGroup,
  BlockReason,
  AlertRecipientGrid,
  AlertRecipientOption,
  AlertTextarea,
  AlertDaysInput,
  AlertDaysLabel,
  AlertPreferenceControl,
  AlertPreferenceInfo,
  AlertPreferenceList,
  AlertPreferenceRow,
  AlertSettingsCard,
  AlertSettingsGrid,
  AlertToggle,
  CustomAlertActions,
  CustomAlertCard,
  CustomAlertGrid,
  CustomAlertHeader,
  CustomAlertMeta,
  CustomAlertObservation,
  CustomAlertTitle,
  Button,
  DayButton,
  Days,
  DetailList,
  EmptyState,
  ErrorBox,
  Field,
  FormGrid,
  FormSection,
  Header,
  HeaderActions,
  Hint,
  IconButton,
  Input,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Page,
  PasswordWrap,
  PermissionGroup,
  PermissionGroups,
  PermissionGroupTitle,
  PermissionOption,
  PolicyCard,
  PolicyGrid,
  PolicyLabel,
  PolicyValue,
  ResultBadge,
  Section,
  SectionHeader,
  SectionTitle,
  Select,
  StatusBadge,
  SuccessBox,
  TabButton,
  Table,
  TableWrap,
  Tabs,
  Title,
  TitleGroup,
  ToggleLabel,
  WeekendCard,
  WeekendGrid,
  WeekendHeader,
  UserCard,
  UserCardHeader,
  UserGrid,
  UserIdentity,
  UserMeta,
  UserName,
} from './styles';
import { formFromUser, type SecurityTab, type UserFormState } from './types';

const DAY_OPTIONS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
];

const UNBLOCK_DURATION_OPTIONS = [
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' },
  { value: 480, label: '8 horas' },
  { value: 720, label: '12 horas' },
  { value: 1440, label: '24 horas' },
  { value: 2880, label: '48 horas' },
  { value: 10080, label: '7 dias' },
];

const FAILURE_LABELS: Record<string, string> = {
  invalid_credentials: 'Credenciais inválidas',
  inactive_user: 'Usuário inativo',
  outside_schedule: 'Fora do horário',
};

interface CustomAlertFormState {
  id: number | null;
  title: string;
  observation: string;
  date: string;
  time: string;
  daysBefore: number;
  isActive: boolean;
  recipientIds: number[];
}

function emptyCustomAlertForm(userIds: number[] = []): CustomAlertFormState {
  return {
    id: null,
    title: '',
    observation: '',
    date: '',
    time: '08:00',
    daysBefore: 0,
    isActive: true,
    recipientIds: userIds,
  };
}

function customAlertFormFromAlert(alert: CustomDailyAlert): CustomAlertFormState {
  const parsed = new Date(alert.scheduled_at);
  const localDate = Number.isNaN(parsed.getTime())
    ? alert.scheduled_at.slice(0, 10)
    : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  const localTime = Number.isNaN(parsed.getTime())
    ? alert.scheduled_at.slice(11, 16) || '08:00'
    : `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;

  return {
    id: alert.id,
    title: alert.title,
    observation: alert.observation,
    date: localDate,
    time: localTime,
    daysBefore: alert.days_before,
    isActive: alert.is_active,
    recipientIds: alert.recipient_ids,
  };
}

const TABS: Array<{ id: SecurityTab; label: string; icon: typeof Users }> = [
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'rules', label: 'Regras de acesso', icon: ShieldCheck },
  { id: 'alerts', label: 'Alertas e notas', icon: BellRing },
  { id: 'blocks', label: 'Bloqueios', icon: Ban },
  { id: 'tryacess', label: 'Tentativas de Acesso', icon: History },
];

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}


function createEmptyForm(
  profiles: AccessProfile[],
  permissionCatalog: PermissionCatalogItem[],
): UserFormState {
  const profile = profiles.find((item) => item.key === 'Operador') ?? profiles[0];

  return {
    id: null,
    name: '',
    username: '',
    phone: '',
    role: profile?.key ?? 'Operador',
    is_active: true,
    password: '',
    theme_preference: 'light',
    menu_permissions:
      profile?.default_permissions ?? permissionCatalog.map((permission) => permission.key),
    access_schedule_enabled: false,
    access_start_time: '08:00',
    access_end_time: '18:00',
    access_days: [1, 2, 3, 4, 5],
    access_timezone: 'America/Sao_Paulo',
    saturday_access_enabled: false,
    saturday_start_time: '08:00',
    saturday_end_time: '12:00',
    sunday_access_enabled: false,
    sunday_start_time: '08:00',
    sunday_end_time: '18:00',
  };
}

function scheduleSummary(user: SecurityUser): string {
  if (!user.access_schedule_enabled) {
    return 'Acesso em qualquer horário';
  }

  const segments: string[] = [];
  const days = DAY_OPTIONS.filter((day) => user.access_days.includes(day.value))
    .map((day) => day.label)
    .join(', ');

  if (days) {
    segments.push(
      `${days} · ${user.access_start_time ?? '--:--'} às ${user.access_end_time ?? '--:--'}`,
    );
  }

  if (user.saturday_access_enabled) {
    segments.push(
      `Sáb · ${user.saturday_start_time ?? '--:--'} às ${user.saturday_end_time ?? '--:--'}`,
    );
  }

  if (user.sunday_access_enabled) {
    segments.push(
      `Dom · ${user.sunday_start_time ?? '--:--'} às ${user.sunday_end_time ?? '--:--'}`,
    );
  }

  return segments.join(' | ') || 'Nenhum período configurado';
}

export function Security() {
  const { user: authenticatedUser, refreshUser } = useAuth();
  const notifications = useNotifications();
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [activeTab, setActiveTab] = useState<SecurityTab>('users');
  const [form, setForm] = useState<UserFormState | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [unblockingKey, setUnblockingKey] = useState('');
  const [releaseDurations, setReleaseDurations] = useState<Record<string, number>>({});
  const [savingAlertUserId, setSavingAlertUserId] = useState<number | null>(null);
  const [customAlertForm, setCustomAlertForm] = useState<CustomAlertFormState | null>(null);
  const [isSavingCustomAlert, setIsSavingCustomAlert] = useState(false);
  const [deletingCustomAlertId, setDeletingCustomAlertId] = useState<number | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      setOverview(await securityService.getOverview());
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível carregar a tela de segurança.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOverview(), 0);
    return () => window.clearTimeout(timer);
  }, [loadOverview]);

  useEffect(() => {
    if (!form) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        setForm(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [form, isSaving]);

  const permissionGroups = useMemo(() => {
    const groups = new Map<string, PermissionCatalogItem[]>();

    overview?.permission_catalog.forEach((permission) => {
      groups.set(permission.group, [...(groups.get(permission.group) ?? []), permission]);
    });

    return Array.from(groups.entries());
  }, [overview?.permission_catalog]);

  function openCreateUser() {
    if (!overview) {
      return;
    }

    setForm(createEmptyForm(overview.access_profiles, overview.permission_catalog));
    setFormError('');
    setIsPasswordVisible(false);
  }

  function openEditUser(user: SecurityUser) {
    setForm(formFromUser(user));
    setFormError('');
    setIsPasswordVisible(false);
  }

  function updateForm<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function handleProfileChange(role: string) {
    const profile = overview?.access_profiles.find((item) => item.key === role);
    setForm((current) =>
      current
        ? {
            ...current,
            role,
            menu_permissions: profile?.default_permissions ?? current.menu_permissions,
          }
        : current,
    );
  }

  function togglePermission(permission: string) {
    setForm((current) => {
      if (!current || current.role === 'Administrador') {
        return current;
      }

      return {
        ...current,
        menu_permissions: current.menu_permissions.includes(permission)
          ? current.menu_permissions.filter((item) => item !== permission)
          : [...current.menu_permissions, permission],
      };
    });
  }

  function toggleDay(day: number) {
    setForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        access_days: current.access_days.includes(day)
          ? current.access_days.filter((item) => item !== day)
          : [...current.access_days, day].sort(),
      };
    });
  }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form || !overview || isSaving) {
      return;
    }

    if (!form.id && !form.password) {
      setFormError('Informe uma senha para o novo usuário.');
      return;
    }

    if (
      form.access_schedule_enabled &&
      form.access_days.length === 0 &&
      !form.saturday_access_enabled &&
      !form.sunday_access_enabled
    ) {
      setFormError('Selecione um dia útil ou adicione um horário de sábado/domingo.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    const payload: SaveUserPayload = {
      name: form.name.trim(),
      username: form.username.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      role: form.role,
      is_active: form.is_active,
      theme_preference: form.theme_preference,
      menu_permissions:
        form.role === 'Administrador'
          ? overview.permission_catalog.map((permission) => permission.key)
          : form.menu_permissions,
      access_schedule_enabled: form.access_schedule_enabled,
      access_start_time: form.access_schedule_enabled ? form.access_start_time : null,
      access_end_time: form.access_schedule_enabled ? form.access_end_time : null,
      access_days: form.access_schedule_enabled ? form.access_days : null,
      access_timezone: form.access_timezone,
      saturday_access_enabled: form.access_schedule_enabled && form.saturday_access_enabled,
      saturday_start_time:
        form.access_schedule_enabled && form.saturday_access_enabled
          ? form.saturday_start_time
          : null,
      saturday_end_time:
        form.access_schedule_enabled && form.saturday_access_enabled
          ? form.saturday_end_time
          : null,
      sunday_access_enabled: form.access_schedule_enabled && form.sunday_access_enabled,
      sunday_start_time:
        form.access_schedule_enabled && form.sunday_access_enabled ? form.sunday_start_time : null,
      sunday_end_time:
        form.access_schedule_enabled && form.sunday_access_enabled ? form.sunday_end_time : null,
      ...(form.password ? { password: form.password } : {}),
    };

    try {
      const response = form.id
        ? await securityService.updateUser(form.id, payload)
        : await securityService.createUser(payload);

      setOverview((current) => {
        if (!current) {
          return current;
        }

        const users = form.id
          ? current.users.map((item) => (item.id === response.user.id ? response.user : item))
          : [...current.users, response.user];

        return {
          ...current,
          users: users.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
        };
      });

      if (authenticatedUser?.id === response.user.id) {
        await refreshUser();
      }

      notifications.success(form.id ? 'Usuário atualizado' : 'Usuário criado', response.message);
      setForm(null);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível salvar o usuário.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setIsSaving(false);
    }
  }

  function updateAlertPreference(
    userId: number,
    alertType: string,
    changes: Partial<Pick<DailyNotePreferenceSetting, 'enabled' | 'days_before'>>,
  ) {
    setOverview((current) => {
      if (!current) return current;

      return {
        ...current,
        users: current.users.map((user) =>
          user.id !== userId
            ? user
            : {
                ...user,
                daily_note_preferences: user.daily_note_preferences.map((preference) =>
                  preference.alert_type === alertType
                    ? { ...preference, ...changes }
                    : preference,
                ),
              },
        ),
      };
    });
  }

  async function saveAlertPreferences(user: SecurityUser) {
    if (savingAlertUserId !== null) return;

    setSavingAlertUserId(user.id);
    try {
      const response = await securityService.updateDailyNotePreferences(
        user.id,
        user.daily_note_preferences,
      );

      setOverview((current) =>
        current
          ? {
              ...current,
              users: current.users.map((item) =>
                item.id === response.user.id ? response.user : item,
              ),
            }
          : current,
      );

      notifications.success('Alertas atualizados', response.message);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível salvar os alertas do usuário.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSavingAlertUserId(null);
    }
  }

  function openNewCustomAlert() {
    const defaultRecipients = overview?.users.filter((item) => item.is_active).map((item) => item.id) ?? [];
    setCustomAlertForm(emptyCustomAlertForm(defaultRecipients));
  }

  function toggleCustomAlertRecipient(userId: number) {
    setCustomAlertForm((current) => {
      if (!current) return current;
      const recipientIds = current.recipientIds.includes(userId)
        ? current.recipientIds.filter((id) => id !== userId)
        : [...current.recipientIds, userId];
      return { ...current, recipientIds };
    });
  }

  async function saveCustomAlert(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customAlertForm || isSavingCustomAlert) return;

    if (!customAlertForm.title.trim() || !customAlertForm.observation.trim()) {
      notifications.error('Preencha o alerta', 'Informe um título e a observação que deve aparecer na notificação.');
      return;
    }

    if (!customAlertForm.date) {
      notifications.error('Informe a data', 'Todo alerta personalizado precisa ter uma data de referência.');
      return;
    }

    if (customAlertForm.recipientIds.length === 0) {
      notifications.error('Selecione os usuários', 'Escolha pelo menos um usuário para receber o alerta.');
      return;
    }

    setIsSavingCustomAlert(true);
    try {
      const payload = {
        title: customAlertForm.title.trim(),
        observation: customAlertForm.observation.trim(),
        scheduled_at: `${customAlertForm.date}T${customAlertForm.time || '08:00'}:00`,
        days_before: Math.max(0, Math.min(365, customAlertForm.daysBefore)),
        is_active: customAlertForm.isActive,
        recipient_ids: customAlertForm.recipientIds,
      };

      const response = customAlertForm.id
        ? await securityService.updateCustomDailyAlert(customAlertForm.id, payload)
        : await securityService.createCustomDailyAlert(payload);

      notifications.success(
        customAlertForm.id ? 'Alerta atualizado' : 'Alerta criado',
        response.message,
      );
      setCustomAlertForm(null);
      await loadOverview();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível salvar o alerta personalizado.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setIsSavingCustomAlert(false);
    }
  }

  async function deleteCustomAlert(alert: CustomDailyAlert) {
    if (deletingCustomAlertId !== null) return;
    if (!window.confirm(`Excluir o alerta "${alert.title}"?`)) return;

    setDeletingCustomAlertId(alert.id);
    try {
      const response = await securityService.deleteCustomDailyAlert(alert.id);
      notifications.success('Alerta removido', response.message);
      await loadOverview();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível excluir o alerta personalizado.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setDeletingCustomAlertId(null);
    }
  }

  async function unblock(username: string, ipAddress: string) {
    const key = `${username}|${ipAddress}`;
    const durationMinutes = releaseDurations[key] ?? 120;
    setUnblockingKey(key);

    try {
      const response = await securityService.unblock(username, ipAddress, durationMinutes);
      notifications.success('Acesso liberado', response.message);
      await loadOverview();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível liberar o acesso.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setUnblockingKey('');
    }
  }

  if (isLoading && !overview) {
    return <Page>Carregando painel de segurança...</Page>;
  }

  return (
    <Page>
      <Header>
        <TitleGroup>
          <Title>Segurança e usuários</Title>
        </TitleGroup>

        <HeaderActions>
          <Button type="button" onClick={() => void loadOverview()} disabled={isLoading}>
            <RefreshCw size={17} aria-hidden="true" />
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button type="button" $variant="primary" onClick={openCreateUser}>
            <Plus size={18} aria-hidden="true" /> Novo usuário
          </Button>
        </HeaderActions>
      </Header>

      <Tabs aria-label="Seções de segurança">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const badge =
            tab.id === 'blocks' && overview?.active_blocks.length
              ? ` (${overview.active_blocks.length})`
              : '';

          return (
            <TabButton
              key={tab.id}
              type="button"
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={17} aria-hidden="true" />
              {tab.label}
              {badge}
            </TabButton>
          );
        })}
      </Tabs>

      {activeTab === 'users' && overview ? (
        <>
          <PolicyGrid>
            <PolicyCard>
              <PolicyValue>{overview.users.length}</PolicyValue>
              <PolicyLabel>Usuários cadastrados</PolicyLabel>
            </PolicyCard>
            <PolicyCard>
              <PolicyValue>{overview.users.filter((user) => user.is_active).length}</PolicyValue>
              <PolicyLabel>Usuários ativos</PolicyLabel>
            </PolicyCard>
            <PolicyCard>
              <PolicyValue>{overview.access_profiles.length}</PolicyValue>
              <PolicyLabel>Perfis de acesso disponíveis</PolicyLabel>
            </PolicyCard>
            <PolicyCard>
              <PolicyValue>{overview.permission_catalog.length}</PolicyValue>
              <PolicyLabel>Menus e submenus controlados</PolicyLabel>
            </PolicyCard>
          </PolicyGrid>

          <Section>
            <SectionHeader>
              <div>
                <SectionTitle>Contas do sistema</SectionTitle>
              </div>
              <Button type="button" $variant="primary" onClick={openCreateUser}>
                <Plus size={17} aria-hidden="true" /> Cadastrar usuário
              </Button>
            </SectionHeader>

            <UserGrid>
              {overview.users.map((user) => (
                <UserCard key={user.id}>
                  <UserCardHeader>
                    <UserIdentity>
                      <UserName>{user.name}</UserName>
                      <UserMeta>@{user.username}</UserMeta>
                    </UserIdentity>
                    <StatusBadge $active={user.is_active}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </UserCardHeader>

                  <DetailList>
                    <dt>Perfil</dt>
                    <dd>{user.role}</dd>
                    <dt>Telefone</dt>
                    <dd>{user.phone || 'Não informado'}</dd>
                    <dt>Tema</dt>
                    <dd>{user.theme_preference === 'dark' ? 'Escuro' : 'Claro'}</dd>
                    <dt>Último login</dt>
                    <dd>{formatDateTime(user.last_login_at)}</dd>
                  </DetailList>

                  <Button type="button" onClick={() => openEditUser(user)}>
                    <Pencil size={16} aria-hidden="true" /> Editar usuário
                  </Button>
                </UserCard>
              ))}
            </UserGrid>
          </Section>
        </>
      ) : null}

      {activeTab === 'rules' && overview ? (
        <Section>
          <SectionHeader>
            <div>
              <SectionTitle>Horários, menus e tema por usuário</SectionTitle>
            </div>
          </SectionHeader>

          <UserGrid>
            {overview.users.map((user) => (
              <UserCard key={user.id}>
                <UserCardHeader>
                  <UserIdentity>
                    <UserName>{user.name}</UserName>
                    <UserMeta>
                      @{user.username} · {user.role}
                    </UserMeta>
                  </UserIdentity>
                  <Palette size={19} aria-label={`Tema ${user.theme_preference}`} />
                </UserCardHeader>

                <DetailList>
                  <dt>Horário</dt>
                  <dd>{scheduleSummary(user)}</dd>
                  <dt>Menus</dt>
                  <dd>{user.menu_permissions.length} liberado(s)</dd>
                  <dt>Tema</dt>
                  <dd>{user.theme_preference === 'dark' ? 'Escuro' : 'Claro'}</dd>
                  <dt>Fuso</dt>
                  <dd>{user.access_timezone}</dd>
                  <dt>Liberação temporária</dt>
                  <dd>
                    {user.temporary_access_until &&
                    new Date(user.temporary_access_until) > new Date()
                      ? `${formatDateTime(user.temporary_access_until)} · ${user.temporary_access_ip ?? 'qualquer IP'}`
                      : 'Nenhuma'}
                  </dd>
                </DetailList>

                <Button type="button" onClick={() => openEditUser(user)}>
                  <UserRoundCog size={16} aria-hidden="true" /> Configurar regras
                </Button>
              </UserCard>
            ))}
          </UserGrid>
        </Section>
      ) : null}

      {activeTab === 'alerts' && overview ? (
        <Section>
          <SectionHeader>
            <div>
              <SectionTitle>Alertas das Notas do dia</SectionTitle>
            </div>
          </SectionHeader>

          <SectionHeader>
            <div>
              <SectionTitle>Alertas personalizados</SectionTitle>
            </div>
            <Button type="button" $variant="primary" onClick={openNewCustomAlert}>
              <Plus size={16} aria-hidden="true" /> Novo alerta
            </Button>
          </SectionHeader>

          {overview.custom_daily_alerts.length ? (
            <CustomAlertGrid>
              {overview.custom_daily_alerts.map((alert) => (
                <CustomAlertCard key={alert.id}>
                  <CustomAlertHeader>
                    <div>
                      <CustomAlertTitle>{alert.title}</CustomAlertTitle>
                      <CustomAlertMeta>
                        <span>{formatDateTime(alert.scheduled_at)}</span>
                        <span>{alert.days_before} dia(s) antes</span>
                        <span>{alert.recipient_names.length} destinatário(s)</span>
                      </CustomAlertMeta>
                    </div>
                    <StatusBadge $active={alert.is_active}>
                      {alert.is_active ? 'Ativo' : 'Pausado'}
                    </StatusBadge>
                  </CustomAlertHeader>

                  <CustomAlertObservation>{alert.observation}</CustomAlertObservation>
                  <CustomAlertMeta>
                    <span>Para: {alert.recipient_names.join(', ') || '—'}</span>
                    <span>Criado por: {alert.creator_name}</span>
                  </CustomAlertMeta>

                  <CustomAlertActions>
                    <Button
                      type="button"
                      onClick={() => setCustomAlertForm(customAlertFormFromAlert(alert))}
                    >
                      <Pencil size={15} aria-hidden="true" /> Editar
                    </Button>
                    <Button
                      type="button"
                      $variant="danger"
                      disabled={deletingCustomAlertId !== null}
                      onClick={() => void deleteCustomAlert(alert)}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      {deletingCustomAlertId === alert.id ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  </CustomAlertActions>
                </CustomAlertCard>
              ))}
            </CustomAlertGrid>
          ) : (
            <EmptyState>Nenhum alerta personalizado cadastrado.</EmptyState>
          )}

          <SectionHeader>
            <div>
              <SectionTitle>Alertas automáticos por usuário</SectionTitle>
            </div>
          </SectionHeader>

          <AlertSettingsGrid>
            {overview.users.map((user) => (
              <AlertSettingsCard key={user.id}>
                <UserCardHeader>
                  <UserIdentity>
                    <UserName>{user.name}</UserName>
                    <UserMeta>@{user.username} · {user.role}</UserMeta>
                  </UserIdentity>
                  <StatusBadge $active={user.is_active}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </StatusBadge>
                </UserCardHeader>

                <AlertPreferenceList>
                  {overview.daily_note_preference_catalog.map((catalogItem) => {
                    const preference = user.daily_note_preferences.find(
                      (item) => item.alert_type === catalogItem.alert_type,
                    ) ?? {
                      alert_type: catalogItem.alert_type,
                      enabled: true,
                      days_before: catalogItem.default_days,
                    };

                    return (
                      <AlertPreferenceRow key={catalogItem.alert_type}>
                        <AlertPreferenceInfo>
                          <strong>{catalogItem.label}</strong>
                        </AlertPreferenceInfo>

                        <AlertPreferenceControl>
                          <AlertToggle>
                            <input
                              type="checkbox"
                              checked={preference.enabled}
                              onChange={(event) =>
                                updateAlertPreference(user.id, catalogItem.alert_type, {
                                  enabled: event.target.checked,
                                })
                              }
                            />
                            Receber
                          </AlertToggle>

                          <AlertDaysInput
                            type="number"
                            min={0}
                            max={365}
                            value={preference.days_before}
                            disabled={!preference.enabled}
                            onChange={(event) =>
                              updateAlertPreference(user.id, catalogItem.alert_type, {
                                days_before: Math.max(0, Math.min(365, Number(event.target.value) || 0)),
                              })
                            }
                            aria-label={`Dias de antecedência para ${catalogItem.label} de ${user.name}`}
                          />
                          <AlertDaysLabel>dias antes</AlertDaysLabel>
                        </AlertPreferenceControl>
                      </AlertPreferenceRow>
                    );
                  })}
                </AlertPreferenceList>

                <Button
                  type="button"
                  $variant="primary"
                  disabled={savingAlertUserId !== null}
                  onClick={() => void saveAlertPreferences(user)}
                >
                  <BellRing size={16} aria-hidden="true" />
                  {savingAlertUserId === user.id ? 'Salvando...' : 'Salvar alertas'}
                </Button>
              </AlertSettingsCard>
            ))}
          </AlertSettingsGrid>
        </Section>
      ) : null}

      {activeTab === 'blocks' && overview ? (
        <>
          <PolicyGrid>
            <PolicyCard>
              <PolicyValue>{overview.policy.max_failed_attempts}</PolicyValue>
              <PolicyLabel>Tentativas antes do bloqueio</PolicyLabel>
            </PolicyCard>
            <PolicyCard>
              <PolicyValue>{overview.policy.attempt_window_minutes} min</PolicyValue>
              <PolicyLabel>Janela de contagem</PolicyLabel>
            </PolicyCard>
            <PolicyCard>
              <PolicyValue>{overview.policy.block_minutes} min</PolicyValue>
              <PolicyLabel>Duração padrão</PolicyLabel>
            </PolicyCard>
            <PolicyCard>
              <PolicyValue>{overview.active_blocks.length}</PolicyValue>
              <PolicyLabel>Bloqueios ativos</PolicyLabel>
            </PolicyCard>
          </PolicyGrid>

          <Section>
            <SectionHeader>
              <div>
                <SectionTitle>Bloqueios ativos</SectionTitle>
              </div>
            </SectionHeader>
            {overview.active_blocks.length ? (
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>IP</th>
                      <th>Motivo</th>
                      <th>Tentativa</th>
                      <th>Liberação automática</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.active_blocks.map((block) => {
                      const key = `${block.username}|${block.ip_address}`;
                      return (
                        <tr key={`${key}|${block.id}`}>
                          <td>
                            {block.name
                              ? `${block.name} (@${block.username})`
                              : `@${block.username}`}
                          </td>
                          <td>{block.ip_address}</td>
                          <td>
                            <BlockReason>
                              <strong>
                                {block.block_type === 'outside_schedule'
                                  ? 'Fora do dia ou horário'
                                  : 'Tentativas incorretas'}
                              </strong>
                              <small>{block.message}</small>
                            </BlockReason>
                          </td>
                          <td>{block.failed_attempt_number ?? '—'}</td>
                          <td>
                            {formatDateTime(
                              block.block_type === 'outside_schedule'
                                ? block.next_access_at
                                : block.blocked_until,
                            )}
                          </td>
                          <td>
                            <BlockActionGroup>
                              <Select
                                value={releaseDurations[key] ?? 120}
                                onChange={(event) =>
                                  setReleaseDurations((current) => ({
                                    ...current,
                                    [key]: Number(event.target.value),
                                  }))
                                }
                                aria-label={`Tempo de liberação para ${block.username}`}
                              >
                                {UNBLOCK_DURATION_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </Select>
                              <Button
                                type="button"
                                $variant="danger"
                                disabled={unblockingKey === key}
                                onClick={() => void unblock(block.username, block.ip_address)}
                              >
                                {unblockingKey === key ? 'Liberando...' : 'Liberar acesso'}
                              </Button>
                            </BlockActionGroup>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrap>
            ) : (
              <EmptyState>
                Nenhum usuário ou IP está bloqueado por tentativas ou aguardando horário de acesso.
              </EmptyState>
            )}
          </Section>
        </>
      ) : null}

      {activeTab === 'tryacess' && overview ? (
        <Section>
          <SectionHeader>
            <div>
              <SectionTitle>Últimas tentativas de acesso</SectionTitle>
            </div>
          </SectionHeader>

          {overview.attempts.length ? (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Usuário</th>
                    <th>IP</th>
                    <th>Resultado</th>
                    <th>Motivo</th>
                    <th>Nº tentativa</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>{formatDateTime(attempt.attempted_at)}</td>
                      <td>
                        {attempt.name
                          ? `${attempt.name} (@${attempt.username})`
                          : `@${attempt.username}`}
                      </td>
                      <td>{attempt.ip_address}</td>
                      <td>
                        <ResultBadge $success={attempt.was_successful}>
                          {attempt.was_successful ? 'Permitido' : 'Recusado'}
                        </ResultBadge>
                      </td>
                      <td>
                        {attempt.failure_reason
                          ? (FAILURE_LABELS[attempt.failure_reason] ?? attempt.failure_reason)
                          : '—'}
                      </td>
                      <td>{attempt.failed_attempt_number ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          ) : (
            <EmptyState>Ainda não existem tentativas registradas.</EmptyState>
          )}
        </Section>
      ) : null}

      {customAlertForm && overview ? (
        <ModalBackdrop
          role="presentation"
          onMouseDown={() => !isSavingCustomAlert && setCustomAlertForm(null)}
        >
          <Modal
            onSubmit={(event) => void saveCustomAlert(event)}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <TitleGroup>
                <ModalTitle>
                  {customAlertForm.id ? 'Editar alerta personalizado' : 'Novo alerta personalizado'}
                </ModalTitle>
              </TitleGroup>
              <IconButton
                type="button"
                onClick={() => setCustomAlertForm(null)}
                disabled={isSavingCustomAlert}
                aria-label="Fechar alerta"
              >
                <X size={19} />
              </IconButton>
            </ModalHeader>

            <ModalBody>
              <FormSection>
                <legend>Alerta</legend>
                <FormGrid>
                  <Field>
                    Nome do alerta
                    <Input
                      value={customAlertForm.title}
                      onChange={(event) =>
                        setCustomAlertForm((current) => current ? { ...current, title: event.target.value } : current)
                      }
                      placeholder="Ex.: Revisão preventiva do caminhão"
                      maxLength={160}
                      required
                    />
                  </Field>
                  <Field>
                    Data do evento / vencimento
                    <Input
                      type="date"
                      value={customAlertForm.date}
                      onChange={(event) =>
                        setCustomAlertForm((current) => current ? { ...current, date: event.target.value } : current)
                      }
                      required
                    />
                  </Field>
                  <Field>
                    Horário
                    <Input
                      type="time"
                      value={customAlertForm.time}
                      onChange={(event) =>
                        setCustomAlertForm((current) => current ? { ...current, time: event.target.value } : current)
                      }
                    />
                  </Field>
                  <Field>
                    Avisar com antecedência
                    <Input
                      type="number"
                      min={0}
                      max={365}
                      value={customAlertForm.daysBefore}
                      onChange={(event) =>
                        setCustomAlertForm((current) => current ? {
                          ...current,
                          daysBefore: Math.max(0, Math.min(365, Number(event.target.value) || 0)),
                        } : current)
                      }
                    />
                  </Field>
                </FormGrid>

                <Field>
                  Observação da notificação
                  <AlertTextarea
                    value={customAlertForm.observation}
                    onChange={(event) =>
                      setCustomAlertForm((current) => current ? { ...current, observation: event.target.value } : current)
                    }
                    placeholder="Escreva exatamente o que os usuários devem visualizar no alerta..."
                    maxLength={4000}
                    required
                  />
                </Field>

                <ToggleLabel>
                  <input
                    type="checkbox"
                    checked={customAlertForm.isActive}
                    onChange={(event) =>
                      setCustomAlertForm((current) => current ? { ...current, isActive: event.target.checked } : current)
                    }
                  />
                  Alerta ativo
                </ToggleLabel>
              </FormSection>

              <FormSection>
                <legend>Quem recebe</legend>
                <AlertRecipientGrid>
                  {overview.users.filter((item) => item.is_active).map((user) => (
                    <AlertRecipientOption key={user.id}>
                      <input
                        type="checkbox"
                        checked={customAlertForm.recipientIds.includes(user.id)}
                        onChange={() => toggleCustomAlertRecipient(user.id)}
                      />
                      <span>{user.name} · @{user.username}</span>
                    </AlertRecipientOption>
                  ))}
                </AlertRecipientGrid>
              </FormSection>
            </ModalBody>

            <ModalFooter>
              <Button
                type="button"
                onClick={() => setCustomAlertForm(null)}
                disabled={isSavingCustomAlert}
              >
                Cancelar
              </Button>
              <Button type="submit" $variant="primary" disabled={isSavingCustomAlert}>
                {isSavingCustomAlert
                  ? 'Salvando...'
                  : customAlertForm.id
                    ? 'Salvar alerta'
                    : 'Criar alerta'}
              </Button>
            </ModalFooter>
          </Modal>
        </ModalBackdrop>
      ) : null}

      {form && overview ? (
        <ModalBackdrop role="presentation" onMouseDown={() => !isSaving && setForm(null)}>
          <Modal
            onSubmit={(event) => void saveUser(event)}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <TitleGroup>
                <ModalTitle>{form.id ? 'Editar usuário' : 'Cadastrar novo usuário'}</ModalTitle>
              </TitleGroup>
              <IconButton
                type="button"
                onClick={() => setForm(null)}
                disabled={isSaving}
                aria-label="Fechar formulário"
              >
                <X size={19} />
              </IconButton>
            </ModalHeader>

            <ModalBody>
              {formError ? <ErrorBox role="alert">{formError}</ErrorBox> : null}

              <FormSection>
                <legend>Cadastro</legend>
                <FormGrid>
                  <Field>
                    Nome
                    <Input
                      value={form.name}
                      onChange={(event) => updateForm('name', event.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </Field>
                  <Field>
                    Usuário
                    <Input
                      value={form.username}
                      onChange={(event) => updateForm('username', event.target.value.toLowerCase())}
                      placeholder="ex.: joao.silva"
                      autoComplete="off"
                      required
                    />
                  </Field>
                  <Field>
                    Telefone
                    <Input
                      value={form.phone}
                      onChange={(event) => updateForm('phone', event.target.value)}
                      placeholder="(00) 00000-0000"
                      inputMode="tel"
                    />
                  </Field>
                  <Field>
                    Perfil de acesso
                    <Select
                      value={form.role}
                      onChange={(event) => handleProfileChange(event.target.value)}
                    >
                      {overview.access_profiles.map((profile) => (
                        <option key={profile.key} value={profile.key}>
                          {profile.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    Status
                    <Select
                      value={form.is_active ? 'active' : 'inactive'}
                      onChange={(event) => updateForm('is_active', event.target.value === 'active')}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </Select>
                  </Field>
                  <Field>
                    Tema da tela
                    <Select
                      value={form.theme_preference}
                      onChange={(event) =>
                        updateForm('theme_preference', event.target.value as 'light' | 'dark')
                      }
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                    </Select>
                  </Field>
                  <Field>
                    {form.id ? 'Nova senha (opcional)' : 'Senha'}
                    <PasswordWrap>
                      <Input
                        type={isPasswordVisible ? 'text' : 'password'}
                        value={form.password}
                        onChange={(event) => updateForm('password', event.target.value)}
                        autoComplete="new-password"
                        placeholder={
                          form.id ? 'Preencha somente para redefinir' : 'Mínimo 8 caracteres'
                        }
                        required={!form.id}
                      />
                      <IconButton
                        type="button"
                        onClick={() => setIsPasswordVisible((current) => !current)}
                        aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                      </IconButton>
                    </PasswordWrap>
                  </Field>
                </FormGrid>
                <Hint>
                  A senha precisa ter no mínimo 8 caracteres, letras maiúsculas e minúsculas e um
                  número. O valor original não poderá ser consultado depois de salvo.
                </Hint>
              </FormSection>

              <FormSection>
                <legend>Horário permitido</legend>
                <ToggleLabel>
                  <input
                    type="checkbox"
                    checked={form.access_schedule_enabled}
                    onChange={(event) =>
                      updateForm('access_schedule_enabled', event.target.checked)
                    }
                  />
                  Restringir este usuário por horário e dias da semana
                </ToggleLabel>

                {form.access_schedule_enabled ? (
                  <>
                    <Hint>
                      Dias úteis usam um horário comum. Sábado e domingo são opcionais e possuem
                      horários próprios.
                    </Hint>
                    <FormGrid>
                      <Field>
                        Início dos dias úteis
                        <Input
                          type="time"
                          value={form.access_start_time}
                          onChange={(event) => updateForm('access_start_time', event.target.value)}
                          disabled={form.access_days.length === 0}
                        />
                      </Field>
                      <Field>
                        Fim dos dias úteis
                        <Input
                          type="time"
                          value={form.access_end_time}
                          onChange={(event) => updateForm('access_end_time', event.target.value)}
                          disabled={form.access_days.length === 0}
                        />
                      </Field>
                      <Field>
                        Fuso horário
                        <Input
                          value={form.access_timezone}
                          onChange={(event) => updateForm('access_timezone', event.target.value)}
                        />
                      </Field>
                    </FormGrid>
                    <Days aria-label="Dias úteis permitidos">
                      {DAY_OPTIONS.map((day) => (
                        <DayButton
                          key={day.value}
                          type="button"
                          $selected={form.access_days.includes(day.value)}
                          onClick={() => toggleDay(day.value)}
                        >
                          {day.label}
                        </DayButton>
                      ))}
                    </Days>

                    <WeekendGrid>
                      <WeekendCard>
                        <WeekendHeader>
                          <div>
                            <strong>Sábado</strong>
                            <Hint>Não interfere na regra dos dias úteis.</Hint>
                          </div>
                          {form.saturday_access_enabled ? (
                            <Button
                              type="button"
                              $variant="danger"
                              onClick={() => updateForm('saturday_access_enabled', false)}
                            >
                              <Trash2 size={16} aria-hidden="true" /> Remover
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => updateForm('saturday_access_enabled', true)}
                            >
                              <Plus size={16} aria-hidden="true" /> Adicionar sábado
                            </Button>
                          )}
                        </WeekendHeader>
                        {form.saturday_access_enabled ? (
                          <FormGrid>
                            <Field>
                              Início
                              <Input
                                type="time"
                                value={form.saturday_start_time}
                                onChange={(event) =>
                                  updateForm('saturday_start_time', event.target.value)
                                }
                              />
                            </Field>
                            <Field>
                              Fim
                              <Input
                                type="time"
                                value={form.saturday_end_time}
                                onChange={(event) =>
                                  updateForm('saturday_end_time', event.target.value)
                                }
                              />
                            </Field>
                          </FormGrid>
                        ) : (
                          <Hint>
                            Sem horário de sábado. O acesso permanecerá bloqueado nesse dia.
                          </Hint>
                        )}
                      </WeekendCard>

                      <WeekendCard>
                        <WeekendHeader>
                          <div>
                            <strong>Domingo</strong>
                            <Hint>Não interfere na regra dos dias úteis.</Hint>
                          </div>
                          {form.sunday_access_enabled ? (
                            <Button
                              type="button"
                              $variant="danger"
                              onClick={() => updateForm('sunday_access_enabled', false)}
                            >
                              <Trash2 size={16} aria-hidden="true" /> Remover
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => updateForm('sunday_access_enabled', true)}
                            >
                              <Plus size={16} aria-hidden="true" /> Adicionar domingo
                            </Button>
                          )}
                        </WeekendHeader>
                        {form.sunday_access_enabled ? (
                          <FormGrid>
                            <Field>
                              Início
                              <Input
                                type="time"
                                value={form.sunday_start_time}
                                onChange={(event) =>
                                  updateForm('sunday_start_time', event.target.value)
                                }
                              />
                            </Field>
                            <Field>
                              Fim
                              <Input
                                type="time"
                                value={form.sunday_end_time}
                                onChange={(event) =>
                                  updateForm('sunday_end_time', event.target.value)
                                }
                              />
                            </Field>
                          </FormGrid>
                        ) : (
                          <Hint>
                            Sem horário de domingo. O acesso permanecerá bloqueado nesse dia.
                          </Hint>
                        )}
                      </WeekendCard>
                    </WeekendGrid>
                  </>
                ) : (
                  <Hint>Sem restrição, o usuário poderá entrar em qualquer dia e horário.</Hint>
                )}
              </FormSection>

              <FormSection>
                <legend>Menus e submenus liberados</legend>
                {form.role === 'Administrador' ? (
                  <SuccessBox>Administradores recebem acesso total automaticamente.</SuccessBox>
                ) : null}
                <PermissionGroups>
                  {permissionGroups.map(([group, permissions]) => (
                    <PermissionGroup key={group}>
                      <PermissionGroupTitle>{group}</PermissionGroupTitle>
                      {permissions.map((permission) => (
                        <PermissionOption key={permission.key}>
                          <input
                            type="checkbox"
                            checked={
                              form.role === 'Administrador' ||
                              form.menu_permissions.includes(permission.key)
                            }
                            disabled={form.role === 'Administrador'}
                            onChange={() => togglePermission(permission.key)}
                          />
                          <span>{permission.label}</span>
                        </PermissionOption>
                      ))}
                    </PermissionGroup>
                  ))}
                </PermissionGroups>
              </FormSection>
            </ModalBody>

            <ModalFooter>
              <Button type="button" onClick={() => setForm(null)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" $variant="primary" disabled={isSaving}>
                {isSaving ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Criar usuário'}
              </Button>
            </ModalFooter>
          </Modal>
        </ModalBackdrop>
      ) : null}
    </Page>
  );
}
