# Gestão de usuários, segurança e permissões — Henrique Transportes

## 1. Visão geral

A área **Segurança** foi transformada em um painel administrativo com quatro abas:

1. **Usuários**: cadastro e edição das contas.
2. **Regras de acesso**: consulta rápida de horários, menus e tema associados a cada conta.
3. **Bloqueios**: consulta e liberação de usuário + IP bloqueados por tentativas incorretas ou aguardando o próximo dia/horário permitido.
4. **Auditoria**: histórico de tentativas de login, IP, resultado, motivo e data.

Somente usuários com perfil `Administrador` acessam essa área.

## 2. Aplicação no banco

Na pasta `backend`:

```bash
php artisan optimize:clear
php artisan migrate
```

A migration nova é:

```text
database/migrations/2026_07_30_010000_add_user_management_fields_to_users_table.php
```

Ela adiciona na tabela `users`:

| Campo | Tipo | Finalidade |
|---|---|---|
| `phone` | varchar(30), nulo | Telefone do usuário |
| `theme_preference` | varchar(12) | Tema `light` ou `dark` |
| `menu_permissions` | JSON | Chaves dos menus e submenus liberados |

As colunas de horário, perfil, status e autenticação já existentes continuam sendo utilizadas.

Existe um SQL manual na raiz:

```text
AJUSTE_BANCO_GESTAO_USUARIOS.sql
```

Não execute o SQL manual se já executou `php artisan migrate`.

## 3. Cadastro de usuário

Abra:

```text
/admin/seguranca
```

Na aba **Usuários**, clique em **Novo usuário** ou **Cadastrar usuário**.

Campos disponíveis:

- Nome;
- Usuário;
- Telefone;
- Perfil de acesso;
- Status;
- Tema da tela;
- Senha;
- Regra de horário;
- Dias permitidos;
- Menus e submenus.

### Regras da senha

A senha precisa ter:

- pelo menos 8 caracteres;
- letra maiúscula;
- letra minúscula;
- número.

O campo possui o botão mostrar/ocultar apenas enquanto o administrador está digitando.

Depois de salvar, a senha original não pode ser consultada. O model `User` utiliza:

```php
'password' => 'hashed'
```

Assim, o Laravel grava somente o hash no PostgreSQL. Na edição, deixe o campo de nova senha vazio para manter a senha atual.

## 4. Perfis de acesso

Perfis disponíveis:

| Perfil | Regra inicial |
|---|---|
| Administrador | Acesso total, incluindo Segurança |
| Gestor | Operação e indicadores, sem gestão de usuários |
| Operador | Rotinas operacionais e cadastros essenciais |
| Visualizador | Dashboard e BI |

Ao selecionar um perfil, a tela marca uma configuração inicial de menus. O administrador pode ajustar os menus individualmente, exceto no perfil Administrador, que sempre recebe acesso total.

Os perfis e suas permissões padrão ficam em:

```text
backend/config/hmt.php
```

## 5. Menus e submenus controlados

Chaves atuais:

| Chave | Tela |
|---|---|
| `dashboard` | Dashboard |
| `bi` | BI Operacional |
| `registrations.vehicles` | Cadastros > Veículos |
| `registrations.employees` | Cadastros > Colaboradores |
| `fuel` | Combustível |
| `travel` | Viagens |
| `settlements` | Acertos |
| `finance` | Financeiro |
| `maintenance` | Manutenção |
| `logistics` | Logística |
| `admin.security` | Segurança e usuários |

### Validação no frontend

O React recebe as permissões no retorno do login e de `/api/auth/me`.

O menu lateral filtra as opções em:

```text
src/navigation/access.ts
src/components/Sidebar/index.tsx
```

As rotas usam `PermissionRoute`, portanto digitar uma URL sem permissão redireciona para a primeira tela permitida. Um usuário sem qualquer menu liberado é enviado para `/sem-acesso`.

### Validação no backend

O Laravel possui o middleware:

```text
app/Http/Middleware/EnsureMenuPermission.php
```

Exemplo de proteção de uma API:

```php
Route::apiResource('fuel', FuelController::class)
    ->middleware('permission:fuel');
```

Ocultar o menu não substitui a proteção do backend. Toda API criada para um módulo deve receber a chave correspondente.

## 6. Tema vinculado ao usuário

O campo `theme_preference` guarda:

```text
light
dark
```

No login, o Laravel devolve a preferência da conta. O `AppThemeProvider` aplica o tema automaticamente.

Quando o próprio usuário alterna o tema pelo cabeçalho, o frontend chama:

```text
PUT /api/auth/theme
```

A nova preferência é gravada no banco e reaparece em outros acessos e dispositivos.

O administrador também pode definir o tema pelo cadastro do usuário.

## 7. Horário de acesso

Quando `access_schedule_enabled` estiver ativo, são usados:

- `access_start_time`;
- `access_end_time`;
- `access_days`;
- `access_timezone`.

A validação acontece:

- durante o login;
- ao consultar `/api/auth/me`;
- nas APIs protegidas pelo middleware `access.schedule`;
- ao voltar para a aba do navegador;
- quando o horário final é atingido.

Turnos que atravessam a madrugada também são suportados.

## 8. Bloqueios e auditoria

Após o limite de tentativas incorretas para o mesmo usuário e IP, o acesso recebe um bloqueio temporário.

Configuração no `.env`:

```env
LOGIN_MAX_FAILED_ATTEMPTS=10
LOGIN_ATTEMPT_WINDOW_MINUTES=15
LOGIN_BLOCK_MINUTES=30
```

Na aba **Bloqueios**, o administrador seleciona um período de 2 horas até 7 dias e clica em **Liberar acesso**. A API limpa `blocked_until` para a combinação usuário + IP e grava uma liberação temporária que pode ignorar a regra de horário durante o prazo escolhido.

A mesma aba também exibe recusas atuais por `outside_schedule`. A API reavalia a regra vigente ao carregar a tela, portanto o item some automaticamente quando o expediente começa, a regra é alterada ou uma liberação temporária passa a valer para aquele IP.

A aba **Auditoria** mostra:

- data e hora;
- nome e usuário;
- endereço IP;
- permitido ou recusado;
- motivo da falha;
- número da tentativa.

## 9. Sessão expirada

O backend envia cabeçalhos com o vencimento da sessão. O React acompanha esse prazo e também trata respostas `401` e `419`.

Quando a sessão expira:

1. o estado autenticado é removido;
2. o usuário volta para `/login`;
3. aparece o aviso: **Sua sessão expirou. Faça o login novamente para continuar.**

## 10. API administrativa

Todas as rotas abaixo exigem sessão válida, horário permitido e perfil Administrador.

### GET `/api/admin/security/overview`

Retorna:

- usuários;
- regras de horário;
- permissões;
- perfis;
- catálogo de menus;
- tentativas;
- bloqueios;
- política de segurança.

### POST `/api/admin/security/users`

Cria um usuário. Exemplo:

```json
{
  "name": "João Operação",
  "username": "joao.operacao",
  "phone": "(11) 99999-0000",
  "role": "Operador",
  "is_active": true,
  "password": "SenhaForte123",
  "theme_preference": "dark",
  "menu_permissions": ["dashboard", "fuel", "travel"],
  "access_schedule_enabled": true,
  "access_start_time": "08:00",
  "access_end_time": "18:00",
  "access_days": [1, 2, 3, 4, 5],
  "access_timezone": "America/Sao_Paulo"
}
```

### PUT `/api/admin/security/users/{id}`

Atualiza cadastro, perfil, tema, permissões e horário. O campo `password` é opcional na edição.

Proteções adicionais:

- o administrador conectado não pode desativar a própria conta;
- o administrador conectado não pode retirar o próprio perfil;
- o sistema mantém pelo menos um administrador ativo.

### POST `/api/admin/security/blocks/unblock`

Entrada:

```json
{
  "username": "joao.operacao",
  "ip_address": "192.168.1.50"
}
```

### PUT `/api/auth/theme`

Atualiza o tema da própria conta.

## 11. Resposta de autenticação

O login e `/api/auth/me` retornam:

```json
{
  "user": {
    "id": 1,
    "name": "Administrador",
    "username": "admin",
    "role": "Administrador",
    "theme_preference": "dark",
    "permissions": ["dashboard", "admin.security"],
    "access": {}
  }
}
```

A senha e o hash nunca são enviados ao frontend.

## 12. Principais arquivos

### Backend

- `app/Http/Controllers/Admin/SecurityController.php`;
- `app/Http/Requests/Admin/StoreUserRequest.php`;
- `app/Http/Requests/Admin/UpdateUserRequest.php`;
- `app/Http/Requests/Admin/UnblockLoginRequest.php`;
- `app/Services/Access/UserMenuAccessService.php`;
- `app/Http/Middleware/EnsureMenuPermission.php`;
- `app/Models/User.php`;
- `config/hmt.php`;
- `routes/api.php`;
- `routes/web.php`.

### Frontend

- `src/pages/Security/index.tsx`;
- `src/pages/Security/styles.ts`;
- `src/services/securityService.ts`;
- `src/services/authService.ts`;
- `src/navigation/access.ts`;
- `src/navigation/constants.ts`;
- `src/routes/components/PermissionRoute/index.tsx`;
- `src/contexts/AppTheme/index.tsx`.

## 13. Teste manual recomendado

### Novo usuário

1. Entre como Administrador.
2. Abra Segurança > Usuários.
3. Cadastre uma conta Operador com somente Dashboard e Viagens.
4. Saia e entre com a nova conta.
5. Confirme que apenas os menus liberados aparecem.
6. Digite manualmente `/finance` e confirme o redirecionamento.

### Tema

1. Configure o usuário como tema escuro.
2. Entre com ele em outro navegador.
3. Confirme que o tema escuro é aplicado.
4. Alterne o tema no cabeçalho, saia e entre novamente.
5. Confirme que a escolha foi preservada.

### Senha

1. Crie o usuário com uma senha temporária.
2. Consulte a tabela `users`.
3. Confirme que a coluna `password` contém um hash e não o texto digitado.
4. Edite o usuário sem preencher nova senha e confirme que a senha antiga continua válida.
5. Edite novamente preenchendo uma nova senha e confirme a troca.

### Permissão de API

Ao criar uma API real de módulo, adicione o middleware correspondente e teste uma conta sem a chave. A API deve retornar `403` com `ACCESS_PERMISSION_DENIED`.

## 14. Comandos de validação

Frontend:

```bash
npm run lint
npm run build
```

Backend:

```bash
cd backend
php artisan route:list --path=api
php artisan test
```

O PHPUnit exige as extensões PHP `dom`, `mbstring`, `xml` e `xmlwriter`.

---

## Atualização: horários de fim de semana e liberação temporária

### Dias úteis

`access_days` passa a guardar somente dias ISO de 1 a 5. O intervalo `access_start_time` / `access_end_time` é usado apenas nos dias úteis selecionados.

### Sábado e domingo opcionais

Cada dia possui sua própria chave de ativação e seu próprio intervalo:

| Campo | Uso |
|---|---|
| `saturday_access_enabled` | Ativa a regra de sábado |
| `saturday_start_time` | Início do sábado |
| `saturday_end_time` | Fim do sábado |
| `sunday_access_enabled` | Ativa a regra de domingo |
| `sunday_start_time` | Início do domingo |
| `sunday_end_time` | Fim do domingo |

Quando o administrador remove sábado ou domingo na tela, a chave de ativação fica falsa e os horários são anulados. O dia removido não altera os horários de segunda a sexta.

### Liberação temporária

A rota `POST /api/admin/security/blocks/unblock` recebe:

```json
{
  "username": "operador",
  "ip_address": "192.0.2.50",
  "duration_minutes": 120
}
```

`duration_minutes` aceita de 120 minutos até 10080 minutos. A API:

1. remove `blocked_until` somente de tentativas com `failure_reason = invalid_credentials`;
2. grava em `users` o prazo e o IP liberados;
3. permite ignorar a regra de horário durante o período;
4. continua exigindo senha correta, usuário ativo e permissões válidas.

Campos envolvidos:

- `temporary_access_until`;
- `temporary_access_ip`;
- `temporary_access_granted_by`;
- `temporary_access_granted_at`.

### Separação entre horário e bloqueio por senha

Recusas por `outside_schedule` não utilizam mais `blocked_until`. Assim, a tela de login não transforma a próxima abertura do expediente em uma mensagem de bloqueio por centenas de minutos. Apenas `invalid_credentials` pode gerar um bloqueio de tentativas.
