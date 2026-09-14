# Correção complementar da média de combustível - 11/09/2026

## Problema encontrado

A versão anterior ainda reaproveitava a menor `vehicle_km_reference` já gravada como âncora da sequência. Em veículos que tinham recebido uma referência baseada no KM atual antes de um lançamento retroativo, essa referência podia ser maior que os KMs históricos.

Exemplo real identificado:

- referência antiga: 365.188 km
- 05/09: 362.000 km
- 07/09: 365.000 km
- 10/09: 367.000 km

Com a referência antiga, 05/09 e 07/09 zeravam e 10/09 calculava incorretamente contra 365.188 km.

## Regra corrigida

1. Os abastecimentos ativos são ordenados por `fuel_date` e `id`.
2. A referência anterior ao primeiro abastecimento só é mantida se ela for menor ou igual ao primeiro KM cronológico.
3. Se a referência estiver acima do primeiro KM, ela é descartada como referência futura/inválida.
4. O primeiro KM conhecido passa a ser o ponto de partida da sequência.
5. Cada abastecimento seguinte usa o último KM cronologicamente válido.
6. O `vehicles.current_km` continua sem diminuir.

Para o exemplo acima:

- 05/09: primeiro ponto conhecido, média 0 quando não existe abastecimento anterior no banco;
- 07/09: (365.000 - 362.000) / 260 = 11,538 km/L;
- 10/09: (367.000 - 365.000) / 260 = 7,692 km/L.

## Banco

Foi adicionada a migration:

`backend/database/migrations/2026_09_11_193000_fix_invalid_fuel_sequence_baseline.php`

Ela recalcula os registros existentes com a nova regra. Também foi incluído o SQL manual:

`sql/AJUSTE_BANCO_CORRECAO_REFERENCIA_MEDIA_COMBUSTIVEL_20260911.sql`

Use a migration ou o SQL manual, não os dois.
