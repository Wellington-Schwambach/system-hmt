# Como aplicar esta atualização

## 1. Faça backup

Antes de atualizar, faça uma cópia do projeto atual e um backup do PostgreSQL.

## 2. Substitua os arquivos

Extraia o ZIP sobre a pasta do projeto ou copie os arquivos alterados.

O pacote não leva `node_modules` nem `backend/vendor`, evitando atalhos quebrados ao extrair.

## 3. Instale dependências, caso necessário

Na pasta principal:

```bash
npm install
```

Na pasta do backend, somente se `backend/vendor` não existir:

```bash
cd backend
composer install
```

## 4. Atualize o banco

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

A migration cria:

- horários opcionais e independentes de sábado;
- horários opcionais e independentes de domingo;
- prazo de liberação temporária;
- IP autorizado temporariamente;
- identificação do administrador que liberou o acesso.

Ela também corrige registros antigos em que uma recusa por horário havia sido gravada como se fosse bloqueio por senha.

Não execute o SQL manual se já executou `php artisan migrate`.

## 5. Inicie o sistema

Na pasta principal:

```bash
npm run dev
```

## Teste sugerido

1. Cadastre dias úteis das 08:00 às 18:00.
2. Adicione sábado das 08:00 às 12:00.
3. Adicione domingo das 08:00 às 18:00.
4. Remova um dos dias e confirme que ele deixa de participar da regra.
5. Gere um bloqueio por tentativas incorretas.
6. Na aba Bloqueios, escolha 2 horas ou mais e clique em **Liberar acesso**.
7. Confirme que a senha correta entra fora do horário apenas pelo IP liberado.
