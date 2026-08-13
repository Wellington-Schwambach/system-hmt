# Segurança e autenticação — Henrique Transportes

## 1. O que foi implementado

O login passou a ter três camadas adicionais:

1. **Horário de acesso por usuário**: o administrador ativa a restrição, define início, fim, dias da semana e fuso horário. O Laravel valida no login e em todas as rotas autenticadas.
2. **Auditoria e bloqueio por tentativas erradas**: cada tentativa registra usuário, IP, navegador, data, resultado e motivo. Ao atingir 10 erros na janela de 15 minutos, a combinação usuário + IP fica bloqueada pelo período padrão. O administrador pode liberar o acesso por 2 horas ou mais, escolhendo o prazo na tela.
3. **Aviso de sessão expirada**: o backend informa o vencimento da sessão; o React controla o prazo, encerra a sessão, redireciona para `/login` e mostra uma mensagem clara.

Os valores 10 tentativas, 15 minutos e 30 minutos são configuráveis no `.env`.

## 2. Como aplicar no banco

Na pasta `backend`:

```bash
php artisan optimize:clear
php artisan migrate
```

A migration cria as colunas de horário em `users` e a tabela `login_attempts`.

Alternativa manual para PostgreSQL: `AJUSTE_BANCO_REGRAS_SEGURANCA.sql`. Não execute o SQL manual depois de rodar a migration.

## 3. Como abrir a tela administrativa

1. Entre com um usuário cujo campo `role` seja exatamente `Administrador`.
2. No menu lateral, clique em **Segurança**.
3. A rota é `/admin/seguranca`.

A tela contém:

- política atual de tentativas e bloqueio;
- quantidade de bloqueios ativos;
- cadastro de horário por usuário;
- dias permitidos;
- últimas tentativas de login;
- IP, resultado, motivo, número da tentativa e prazo do bloqueio.

Usuários sem perfil de administrador não veem o menu e são redirecionados se tentarem abrir a rota manualmente. A API também valida o perfil, portanto ocultar o menu não é a única proteção.

## 4. Funcionamento do horário

Campos adicionados em `users`:

| Campo | Finalidade |
|---|---|
| `access_schedule_enabled` | Ativa ou desativa a restrição |
| `access_start_time` | Horário inicial |
| `access_end_time` | Horário final |
| `access_days` | Dias úteis ISO: 1=segunda até 5=sexta |
| `saturday_access_enabled` | Ativa o horário independente de sábado |
| `saturday_start_time` / `saturday_end_time` | Intervalo de sábado |
| `sunday_access_enabled` | Ativa o horário independente de domingo |
| `sunday_start_time` / `sunday_end_time` | Intervalo de domingo |
| `access_timezone` | Fuso usado na comparação |

Quando a restrição está desativada, o usuário pode acessar em qualquer horário.

Quando está ativada:

- o login é recusado fora do período;
- uma sessão já aberta é encerrada quando o expediente termina;
- o bloqueio continua até o próximo dia e horário autorizado;
- horários que atravessam a madrugada também funcionam, por exemplo 22:00–06:00;
- a resposta informa a próxima data de acesso.

Resposta fora do horário:

```json
{
  "message": "Acesso permitido somente no horário cadastrado...",
  "code": "ACCESS_OUTSIDE_SCHEDULE",
  "next_access_at": "2026-07-31T11:00:00+00:00"
}
```

Status HTTP: `423 Locked`.

## 5. Tentativas erradas e IP

A tabela `login_attempts` registra:

- usuário digitado;
- ID do usuário, quando encontrado;
- endereço IP;
- `User-Agent` do navegador;
- sucesso ou falha;
- motivo da falha;
- número sequencial da tentativa errada;
- data e hora;
- prazo do bloqueio;
- metadados da rota e método HTTP.

Motivos principais:

- `invalid_credentials`;
- `inactive_user`;
- `outside_schedule`.

Após 10 credenciais inválidas para o mesmo usuário e IP dentro de 15 minutos, o décimo registro recebe `blocked_until`. Novas tentativas retornam `429 Too Many Requests` até o prazo terminar.

Configuração no `.env`:

```env
LOGIN_MAX_FAILED_ATTEMPTS=10
LOGIN_ATTEMPT_WINDOW_MINUTES=15
LOGIN_BLOCK_MINUTES=30
```

Consulta rápida:

```sql
SELECT username, ip_address, was_successful, failure_reason,
       failed_attempt_number, blocked_until, attempted_at
FROM login_attempts
ORDER BY attempted_at DESC
LIMIT 100;
```

## 6. Sessão expirada

O Laravel continua sendo a fonte oficial da autenticação por sessão e Sanctum.

O middleware `AddSessionExpirationHeaders` adiciona nas respostas autenticadas:

- `X-Session-Expires-At`;
- `X-Session-Lifetime-Minutes`.

O interceptor do Axios lê esse prazo. Quando expira:

1. o frontend chama o logout;
2. limpa o marcador local;
3. remove o usuário do `AuthContext`;
4. redireciona para `/login`;
5. mostra: **“Sua sessão expirou. Faça o login novamente para continuar.”**

Erros `401` e `419` vindos do Laravel também acionam o mesmo aviso. Ao retornar para a aba ou trocar de tela, `/api/auth/me` é consultado novamente.

O prazo vem de:

```env
SESSION_LIFETIME=240
```

## 7. Telas validadas

Todas as telas abaixo ficam dentro de `ProtectedRoute` e fazem nova verificação ao navegar:

- `/dashboard`;
- `/bi`;
- `/fuel`;
- `/travel`;
- `/acertos`;
- `/finance`;
- `/maintenance`;
- `/logistic`;
- `/cadastros/veiculos`;
- `/cadastros/colaboradores`;
- `/admin/seguranca`.

A rota administrativa ainda passa por `AdministratorRoute`.

No backend, todas as APIs internas usam:

```php
['auth:sanctum', 'access.schedule', 'session.expiration']
```

Isso significa que alterar o React ou digitar uma URL manualmente não ignora a segurança do Laravel.

## 8. API de autenticação

### POST `/api/auth/login`

Entrada:

```json
{
  "username": "admin",
  "password": "senha",
  "remember": false
}
```

Valida credenciais, usuário ativo, bloqueio de tentativas e horário.

### GET `/api/auth/me`

Retorna o usuário da sessão e o período atual de acesso. É usado no início da aplicação, na troca de telas e ao voltar para a aba.

### POST `/api/auth/logout`

Encerra a sessão, invalida o ID e regenera o token CSRF.

## 9. API administrativa

As duas rotas exigem autenticação, horário válido e perfil Administrador.

### GET `/api/admin/security/overview`

Retorna:

- usuários e horários;
- últimas tentativas;
- bloqueios ativos;
- política configurada.

### PUT `/api/admin/security/users/{id}/access-schedule`

Exemplo:

```json
{
  "access_schedule_enabled": true,
  "access_start_time": "07:30",
  "access_end_time": "18:00",
  "access_days": [1, 2, 3, 4, 5],
  "access_timezone": "America/Sao_Paulo"
}
```

## 10. Códigos HTTP importantes

| Código | Significado |
|---|---|
| `200` | Operação concluída |
| `401` | Não autenticado ou sessão encerrada |
| `403` | Usuário inativo ou sem permissão administrativa |
| `419` | Token CSRF ou sessão de segurança expirados |
| `422` | Dados inválidos ou credenciais incorretas |
| `423` | Fora do horário permitido |
| `429` | Bloqueio por tentativas ou limite de rajada |

## 11. Principais arquivos

### Backend

- `app/Http/Controllers/Auth/AuthController.php`: fluxo completo do login.
- `app/Services/Auth/LoginSecurityService.php`: grava e conta tentativas.
- `app/Services/Auth/UserAccessScheduleService.php`: calcula horário e próximo acesso.
- `app/Http/Middleware/EnsureUserAccessSchedule.php`: protege APIs durante a sessão.
- `app/Http/Middleware/AddSessionExpirationHeaders.php`: informa o vencimento ao frontend.
- `app/Http/Middleware/EnsureAdministrator.php`: protege a administração.
- `app/Http/Controllers/Admin/SecurityController.php`: dados da tela Segurança.
- `database/migrations/2026_07_30_000100_add_access_schedule_and_login_audit.php`: banco.

### Frontend

- `src/services/api.ts`: interceptor global de sessão e horário.
- `src/services/authSession.ts`: eventos e prazo da sessão.
- `src/contexts/Auth/index.tsx`: estado, logout automático e avisos.
- `src/routes/components/ProtectedRoute/index.tsx`: valida troca de tela.
- `src/routes/components/AdministratorRoute/index.tsx`: valida perfil.
- `src/pages/Security/index.tsx`: tela administrativa.

## 12. Teste manual sugerido

### Horário

1. Na tela Segurança, configure um usuário para um período que já terminou.
2. Tente entrar com ele.
3. Verifique a mensagem e o próximo horário.
4. Volte o horário para um período válido e teste novamente.

### Tentativas

1. Use o mesmo usuário e senha errada dez vezes.
2. Na décima tentativa, confira a mensagem de bloqueio.
3. Entre como administrador e abra Segurança.
4. Confira o IP em Bloqueios ativos e no histórico.

### Sessão

1. Para testar rapidamente, altere temporariamente `SESSION_LIFETIME=1`.
2. Rode `php artisan optimize:clear`.
3. Entre no sistema e aguarde pouco mais de um minuto sem atividade.
4. O sistema deve voltar ao login e mostrar o aviso.
5. Restaure o valor normal depois do teste.

## 13. Produção e IP real

Em um servidor com proxy, balanceador, Cloudflare ou outro intermediário, configure proxies confiáveis no Laravel. Sem isso, o endereço registrado pode ser o IP do proxy em vez do cliente.

Não exponha `APP_DEBUG=true` em produção e não versione o arquivo `.env` com senhas reais.
