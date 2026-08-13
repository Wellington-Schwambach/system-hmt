# Backend Henrique Transportes

API Laravel 13 com PostgreSQL e autenticação SPA via Laravel Sanctum.

## Instalação

```bash
composer install
php artisan optimize:clear
php artisan migrate --seed
php artisan serve
```

## Rotas de autenticação

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Usuário administrador

O login utiliza `username`; a tabela `users` não possui mais e-mail.

As credenciais usadas pelo seeder ficam nas variáveis abaixo do `.env`:

```env
ADMIN_NAME=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

Para criar o usuário:

```bash
php artisan db:seed
```

## Testes

```bash
php artisan test
```


## Atualizar banco existente

```bash
php artisan optimize:clear
php artisan migrate
```

A migration converte automaticamente o e-mail antigo em usuário, mantendo a mesma senha. `admin@hmt.com.br`, por exemplo, passa a ser `admin`.

O SQL manual equivalente está em `database/sql/convert_users_email_to_username.sql`.
