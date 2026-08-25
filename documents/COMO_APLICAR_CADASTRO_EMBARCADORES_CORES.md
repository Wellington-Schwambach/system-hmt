# Cadastro de Embarcadores com cores

## O que foi criado

Foi adicionada a nova tela **Cadastros > Embarcadores**, seguindo o mesmo padrão visual dos cadastros de Veículos e Colaboradores.

A tela permite:

- cadastrar embarcador;
- editar nome, cor e status;
- pesquisar por nome;
- filtrar Ativos, Inativos ou Todos;
- paginação em 10, 25 ou 50 registros;
- excluir embarcadores ainda não utilizados;
- inativar embarcadores que já possuem viagens, preservando o histórico.

## Cor do embarcador

Cada embarcador possui `display_color` no PostgreSQL.

A cor aparece como identificação visual na própria tela e também no badge de **Embarcador** da tela de Viagens.

As cores iniciais são:

- BRF: `#2563EB`
- Aurora: `#16A34A`
- Milia: `#7C3AED`
- GEO: `#EA580C`
- Itracon: `#0891B2`

Outros embarcadores já existentes recebem automaticamente uma cor da paleta.

Um embarcador criado pelo botão `(+)` dentro de Viagens também recebe automaticamente uma cor inicial. Depois ela pode ser personalizada em **Cadastros > Embarcadores**.

## Permissão

Foi criada a permissão:

`registrations.shippers`

Ela aparece na tela de Segurança em **Cadastros > Embarcadores**.

A migration libera essa permissão automaticamente para usuários que já possuíam perfil Administrador, Gestor ou Operador, ou que já tinham acesso a Veículos/Colaboradores.

## Aplicar no banco

Na pasta `backend`:

```bash
php artisan optimize:clear
php artisan migrate
```

Depois, na raiz do projeto:

```bash
npm install
npm run dev
```

Não execute o SQL manual se já tiver executado `php artisan migrate`.

O SQL alternativo está em:

`sql/AJUSTE_BANCO_CADASTRO_EMBARCADORES_CORES.sql`

## APIs

- `GET /api/shippers`
- `POST /api/shippers`
- `PUT /api/shippers/{shipper}`
- `DELETE /api/shippers/{shipper}`

Todas exigem autenticação, horário válido e a permissão `registrations.shippers`.

## Exclusão e histórico

Se o embarcador já possuir viagens vinculadas, o backend não permite exclusão definitiva. A tela orienta a alterar o status para **Inativo**.

Isso mantém as viagens antigas intactas e retira o embarcador dos selects de novos lançamentos.
