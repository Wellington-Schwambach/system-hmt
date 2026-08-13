# Atualização da tela de Viagens — múltiplos CT-es

## O que mudou

- O filtro de Embarcador usa os embarcadores ativos gravados em `shippers`.
- Um embarcador criado pelo botão `+` entra imediatamente no cadastro e no filtro.
- Novo filtro **Tipo de CT-e**: Normal e Complemento de frete.
- Uma viagem agora pode possuir vários CT-es.
- Cada CT-e possui:
  - Tipo;
  - Número;
  - Série;
  - Frete líquido;
  - Seguro;
  - Pedágio;
  - ICMS;
  - Frete bruto calculado.
- Origem, destino, cavalo/terceiro, motoristas, embarcador e recebimento continuam no nível da viagem.
- Os CT-es antigos são migrados automaticamente para a nova tabela `travel_ctes`.

## Aplicação recomendada

Na pasta do backend:

```bash
php artisan optimize:clear
php artisan migrate
```

Depois, na raiz:

```bash
npm install
npm run dev
```

Não execute o SQL manual se já tiver executado `php artisan migrate`.

## SQL manual

Caso prefira aplicar a alteração diretamente no PostgreSQL, use:

`sql/AJUSTE_BANCO_MULTIPLOS_CTES_VIAGENS.sql`

## Estrutura

A tabela `travels` continua sendo a viagem.

A nova tabela `travel_ctes` armazena os CT-es vinculados:

```text
travels
  1
  └── N travel_ctes
```

Os totais da viagem continuam sincronizados em `travels` para manter compatibilidade temporária com BI e Acertos.
