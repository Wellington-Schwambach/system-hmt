# Atualização da tela de Viagens: vínculos e embarcadores

## O que mudou

- Cavalos vêm da tabela `vehicles`, somente registros `TRACTOR` ativos.
- Carretas vêm da tabela `vehicles`, somente registros `TRAILER` ativos.
- Motoristas vêm da tabela `employees`, somente colaboradores ativos cujo cargo contém `Motorista`.
- Embarcadores agora possuem cadastro próprio na tabela `shippers`.
- A viagem grava `shipper_id` como vínculo e mantém o nome do embarcador como histórico.
- O botão `+` ao lado do embarcador abre um cadastro rápido. Ao salvar, o novo embarcador é selecionado automaticamente.
- Filtros de placa e embarcador são alimentados pelo banco.
- As opções auxiliares são atualizadas novamente quando o usuário abre o cadastro/edição de uma viagem.
- O carregamento inicial de opções deixou de gerar um alerta genérico na entrada da tela.

## Aplicação recomendada

Na pasta do backend:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

Depois, na raiz do projeto:

```bash
npm install
npm run dev
```

Não execute o SQL manual se você já executou `php artisan migrate`.

## SQL manual

O arquivo `AJUSTE_BANCO_EMBARCADORES_E_VINCULOS_VIAGENS.sql` faz a mesma alteração estrutural para quem preferir atualizar diretamente pelo PostgreSQL.

## Cadastro rápido de embarcador

Endpoint:

```text
POST /api/travels/shippers
```

Payload:

```json
{
  "name": "Nome do embarcador"
}
```

O nome é único sem diferenciar letras maiúsculas e minúsculas.

## Endpoint de opções

```text
GET /api/travels/options
```

Retorna:

- `tractors`
- `trailers`
- `drivers`
- `shippers`
- `filter_shippers`
- `filter_plates`

Esses dados vêm do PostgreSQL e não de listas fixas no React.

## Sobre o alerta ao abrir a tela

Antes, `GET /api/travels` e `GET /api/travels/options` eram executados juntos em `Promise.all`. Se apenas o endpoint dos selects falhasse, a tela disparava o alerta genérico de erro.

Agora os carregamentos são independentes:

- a entrada na tela não dispara toast por falha de opções auxiliares;
- se a listagem falhar, a informação aparece discretamente na área da listagem;
- se o usuário abrir o formulário e as opções continuarem indisponíveis, recebe uma mensagem específica sobre os cadastros auxiliares.
