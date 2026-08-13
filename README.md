# Henrique Transportes

Sistema em React + TypeScript no frontend e Laravel + PostgreSQL no backend.

## Inicialização rápida

Na pasta principal do projeto:

```bash
npm install
npm run dev
```

Esse único comando inicia:

- frontend em `http://localhost:5173`;
- backend Laravel em `http://127.0.0.1:8000`.

O frontend usa o proxy do Vite para encaminhar `/api` e `/sanctum` ao Laravel. Assim, o login não depende de misturar `localhost` e `127.0.0.1` nem de configurar CORS manualmente durante o desenvolvimento.

## Primeira preparação do backend

Execute uma vez:

```bash
cd backend
composer install
php artisan optimize:clear
php artisan migrate --seed
cd ..
```

Depois disso, use apenas:

```bash
npm run dev
```

## Requisitos do PHP

Para PostgreSQL, a extensão abaixo precisa estar ativa no `php.ini`:

```ini
extension=pdo_pgsql
```

Também é recomendado ativar:

```ini
extension=pgsql
extension=mbstring
extension=dom
extension=xml
extension=xmlwriter
```

No Windows, depois de alterar o `php.ini`, feche e abra o terminal novamente.

Para confirmar a extensão principal:

```bash
php -m | findstr pdo_pgsql
```

No Linux/macOS:

```bash
php -m | grep pdo_pgsql
```

## Banco de dados

A conexão fica em:

```text
backend/.env
```

Revise estes campos antes da migration:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=hmt_transportes
DB_USERNAME=hmt_user
DB_PASSWORD=sua_senha
```

## Autenticação

Fluxo implementado:

```text
GET  /sanctum/csrf-cookie
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Também estão implementados:

- sessão por cookie HTTP-only;
- proteção CSRF;
- rotas privadas no React;
- recuperação da sessão ao atualizar a página;
- logout seguro;
- bloqueio de usuário inativo;
- limite de tentativas de login;
- registro de último login.

## Comandos separados

Somente backend:

```bash
npm run dev:backend
```

Somente frontend:

```bash
npm run dev:frontend
```

## Validação

```bash
npm run lint
npm run build
```

Backend:

```bash
cd backend
php artisan route:list --path=api/auth
php artisan test
```

## Produção

Em produção, defina `VITE_API_URL` com a URL pública do backend. Também ajuste `APP_URL`, `FRONTEND_URLS`, `SANCTUM_STATEFUL_DOMAINS`, HTTPS e cookies seguros no `backend/.env`.

## Login por usuário

A autenticação usa o campo `username`; o e-mail não faz mais parte da conta de acesso.

Para atualizar um banco que já possui a tabela `users`, execute:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

A migration preserva nome, senha, perfil, status e último login. O usuário inicial é criado a partir da parte anterior ao `@` do e-mail antigo. Exemplo:

```text
admin@hmt.com.br → admin
```

Depois da migration, entre com o novo usuário e a mesma senha anterior.

Para instalações novas, configure no `backend/.env`:

```env
ADMIN_NAME="Administrador"
ADMIN_USERNAME=admin
ADMIN_PASSWORD="sua-senha-forte"
```

E execute:

```bash
php artisan migrate --seed
```

O SQL equivalente para PostgreSQL também está disponível em:

```text
backend/database/sql/convert_users_email_to_username.sql
```

## Regras de segurança do login

O projeto inclui horário de acesso por usuário, auditoria de tentativas/IP, bloqueio temporário após 10 erros, alerta de sessão expirada e a tela administrativa **Segurança**.

Depois de atualizar o projeto, execute:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
cd ..
npm install
npm run dev
```

A documentação detalhada está em `DOCUMENTACAO_SEGURANCA_AUTENTICACAO.md`.

## Gestão de usuários, menus e tema

A área `/admin/seguranca` agora possui abas para usuários, regras de acesso, bloqueios e auditoria.

Depois de atualizar o projeto, execute:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
cd ..
npm install
npm run dev
```

Recursos principais:

- cadastro e edição de usuários;
- nome, usuário, telefone, status e perfil;
- criação e redefinição de senha com hash do Laravel;
- horário e dias permitidos;
- menus e submenus por conta;
- tema claro/escuro persistido no usuário;
- desbloqueio de usuário + IP pela interface;
- proteção de rotas React e middleware de permissão Laravel.

Manual detalhado:

```text
DOCUMENTACAO_GESTAO_USUARIOS_E_ACESSOS.md
Documentacao_Gestao_Usuarios_Acessos_HMT.docx
```

## Horários separados de sábado e domingo

A regra principal agora atende apenas segunda a sexta. Sábado e domingo são opcionais e possuem horários próprios.

Na tela **Segurança → Usuários/Regras de acesso**:

1. ative a restrição de horário;
2. selecione os dias úteis e o horário comum;
3. clique em **Adicionar sábado** ou **Adicionar domingo** somente quando necessário;
4. use **Remover** para excluir completamente a regra daquele dia.

Um fim de semana não adicionado não interfere na regra dos dias úteis e permanece sem acesso.

## Liberação temporária após bloqueio

Na aba **Bloqueios**, o administrador escolhe um período entre 2 horas e 7 dias e clica em **Liberar acesso**. A lista reúne tanto bloqueios por excesso de senhas incorretas quanto usuários que tentaram acessar fora do dia ou horário permitido.

A liberação:

- remove o bloqueio por tentativas incorretas;
- ignora temporariamente a regra de horário;
- vale somente para o usuário e IP selecionados;
- não ignora senha, status da conta ou permissões de menu;
- expira automaticamente no horário informado.

O alerta do login não exibe mais uma quantidade confusa de minutos. Bloqueio por senha e recusa por horário agora são tratados separadamente.

Para aplicar no banco existente:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

O SQL manual equivalente está em:

```text
AJUSTE_BANCO_HORARIOS_FIM_SEMANA_LIBERACAO.sql
```

## Cadastro de veículos com PostgreSQL

O módulo **Cadastros > Veículos** possui CRUD completo, CRLV privado com vigência e exportação para Excel. Para aplicar a tabela nova:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

Consulte `COMO_APLICAR_CADASTRO_VEICULOS.md` para o fluxo da API e os testes manuais.

## Cadastro de colaboradores

O módulo de colaboradores usa PostgreSQL, possui CRUD completo, documentos privados
(CNH, ASO, toxicológico e ficha de registro) e exportação Excel conforme o filtro atual.
Consulte `COMO_APLICAR_CADASTRO_COLABORADORES.md`.

## Viagens - PostgreSQL

O módulo Viagens utiliza a tabela `travels` e as rotas `/api/travels`. Consulte `COMO_APLICAR_CADASTRO_VIAGENS.md` antes de aplicar a migration em um banco existente.

## Viagens: vínculos de banco e embarcadores

A tela de Viagens utiliza os cadastros reais de veículos e colaboradores. Cavalos, carretas e motoristas são consultados na API ao entrar na tela e novamente ao abrir o formulário de viagem.

Os embarcadores possuem tabela própria (`shippers`) e podem ser cadastrados diretamente no formulário de viagem pelo botão `+`. O novo embarcador é selecionado automaticamente após o cadastro.

Os filtros de placa e embarcador também são alimentados pelo PostgreSQL. Consulte `COMO_APLICAR_EMBARCADORES_E_VINCULOS_VIAGENS.md` para os detalhes da atualização.
