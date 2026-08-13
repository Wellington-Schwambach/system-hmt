import {
  Ban,
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
  type SaveUserPayload,
  type SecurityOverview,
  type SecurityUser,
} from '../../services/securityService';
import { getApiErrorFeedback } from '../../utils/apiError';
import {
  BlockActionGroup,
  BlockReason,
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

const TABS: Array<{ id: SecurityTab; label: string; icon: typeof Users }> = [
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'rules', label: 'Regras de acesso', icon: ShieldCheck },
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
                <Hint>
                  Edite os dados ou redefina a senha deixando uma nova senha no formulário.
                </Hint>
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
              <Hint>
                A interface oculta os menus não liberados e as rotas também verificam a permissão.
              </Hint>
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
                <Hint>
                  Ao liberar, escolha o período. O usuário poderá ignorar a regra de horário somente
                  nesse IP, mas ainda precisará informar a senha correta e estar ativo.
                </Hint>
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
              <Hint>O histórico registra usuário, IP, resultado, data e motivo da recusa.</Hint>
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

      {form && overview ? (
        <ModalBackdrop role="presentation" onMouseDown={() => !isSaving && setForm(null)}>
          <Modal
            onSubmit={(event) => void saveUser(event)}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <TitleGroup>
                <ModalTitle>{form.id ? 'Editar usuário' : 'Cadastrar novo usuário'}</ModalTitle>
                <Hint>
                  {form.id
                    ? 'Deixe a senha vazia para manter a atual.'
                    : 'A senha será convertida automaticamente pelo Sistema.'}
                </Hint>
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
