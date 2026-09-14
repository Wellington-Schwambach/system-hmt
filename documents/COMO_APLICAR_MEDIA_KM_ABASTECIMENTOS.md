# Média de KM dos abastecimentos

## Regra atual

O `vehicles.current_km` continua sendo o hodômetro atual da frota e **nunca é reduzido automaticamente**.

A média de um abastecimento, porém, não usa mais o `current_km` atual como referência histórica. O cálculo segue a sequência cronológica dos abastecimentos ativos do mesmo cavalo:

```text
Referência = último KM válido de abastecimento anterior
Distância  = KM do abastecimento - Referência
Média      = Distância / Litros de Diesel
```

Exemplo:

```text
02/09  196.000 km
05/09  198.000 km  -> referência 196.000
08/09  200.000 km  -> referência 198.000
```

Se o registro de 08/09 for lançado antes e o de 05/09 for cadastrado depois, o sistema recalcula a sequência automaticamente. O registro de 08/09 deixa de usar 196.000 e passa a usar 198.000 como referência.

## Lançamentos retroativos

Ao cadastrar, editar, inativar ou reativar um abastecimento, o Laravel recalcula os registros ativos do veículo em ordem de:

1. `fuel_date`;
2. `id` para desempate de registros no mesmo dia.

Isso evita que um lançamento atrasado gere média zero apenas porque o KM atual do veículo já está mais alto.

## KM atual do veículo

O `vehicles.current_km` só é atualizado quando o KM informado no abastecimento for maior ou igual ao KM atual. Um lançamento retroativo pode recalcular médias históricas, mas **não reduz o hodômetro atual**.

Exemplo:

```text
KM atual do veículo: 200.000
Lançamento retroativo: 05/09 com 198.000 km
```

O registro de 05/09 pode usar 196.000 como referência e calcular a média normalmente, enquanto o cadastro do veículo continua em 200.000 km.

## KM opcional e leituras inconsistentes

- O KM do abastecimento continua opcional.
- Sem KM, a distância fica sem cálculo e a média fica em `0,000 km/L`.
- Um registro sem KM não interrompe a sequência: o próximo registro usa o último KM válido anterior.
- Se houver uma leitura realmente regressiva em relação à sequência cronológica, ela fica sem distância/média e não passa a ser referência dos registros seguintes.

## Campos históricos

Cada abastecimento mantém:

- `vehicle_km_reference`: KM cronológico usado como referência;
- `distance_km`: distância calculada;
- `diesel_average`: média em km/L.

## Atualização do banco

A migration nova também reconstrói as médias já existentes para corrigir registros retroativos cadastrados com a regra antiga:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

Migration:

```text
2026_09_11_180000_recalculate_fuel_metrics_chronologically.php
```

Se preferir aplicar manualmente no PostgreSQL, use:

```text
sql/AJUSTE_BANCO_RECALCULO_MEDIA_COMBUSTIVEL_20260911.sql
```

Use **migration ou SQL manual**, não os dois para a mesma finalidade.
