# Correção do cadastro de viagens: Frota própria e Terceiro

## O que foi corrigido

A validação do backend agora separa completamente os dois modos de operação.

### Frota própria

Obrigatórios:

- cavalo;
- primeiro motorista;
- dados gerais da viagem;
- embarcador;
- ao menos um CT-e.

Os campos de terceiro são descartados antes da gravação, mesmo que tenham restado no formulário por alguma versão antiga do frontend.

### Terceiro contratado

Obrigatórios:

- nome ou razão social do terceiro;
- placa do terceiro;
- valor de repasse;
- dados gerais da viagem;
- embarcador;
- ao menos um CT-e.

Os campos de cavalo e motoristas são descartados antes da gravação. Eles não podem provocar erro de chave estrangeira ou obrigatoriedade no modo Terceiro.

## Atualização do banco

Dentro da pasta `backend`:

```bash
php artisan optimize:clear
php artisan migrate
```

A migration `2026_08_13_190000_repair_travel_operation_modes.php`:

- garante que cavalo e motoristas sejam opcionais no banco;
- garante que os campos de terceiro sejam opcionais no banco;
- amplia o nome histórico do embarcador para 100 caracteres;
- remove a restrição única antiga da tabela `travels`;
- mantém a unicidade oficial dos CT-es na tabela `travel_ctes`;
- limpa campos incompatíveis de registros antigos.

Caso não utilize migrations, execute somente:

```text
sql/AJUSTE_BANCO_VALIDACAO_VIAGENS_FROTA_TERCEIRO.sql
```

Não execute o SQL manual e a migration para o mesmo ajuste.

## Iniciar o sistema

Na pasta principal:

```bash
npm install
npm run dev
```

## Mensagens de erro

O backend passou a diferenciar:

- CT-e duplicado;
- cadastro auxiliar removido;
- texto maior que o permitido;
- estrutura do banco desatualizada;
- falha inesperada de gravação.

## Testes incluídos

Arquivo:

```text
backend/tests/Feature/Operation/TravelManagementTest.php
```

Ele cobre cadastro e edição nas modalidades Frota própria e Terceiro contratado.
