# Média de KM dos abastecimentos

## Regra implementada

Ao selecionar um cavalo, a tela consulta o `current_km` do cadastro de Veículos e mostra esse valor em **KM atual do veículo**.

O campo **KM do abastecimento** continua opcional.

Quando informado:

```text
Distância = KM do abastecimento - KM atual do veículo
Média = Distância / Litros de Diesel
```

Exemplo:

```text
KM atual do veículo: 1.025.088
KM do abastecimento: 1.026.088
Distância:            1.000 km
Diesel:               400 L
Média:                2,50 km/L
```

Se o KM do abastecimento não for informado, `distance_km` e `diesel_average` ficam `NULL` e a tela mostra `—`.

Se o KM informado for menor que a referência do veículo, o Laravel recusa o salvamento com uma mensagem amigável para evitar média incorreta.

## Atualização automática do KM do veículo

Ao salvar um abastecimento com KM maior que o `current_km` cadastrado, o próprio Laravel atualiza `vehicles.current_km` para a nova leitura.

Isso faz com que o próximo abastecimento utilize a leitura anterior como nova referência e evita somar quilômetros de vários períodos.

O sistema nunca reduz o KM do veículo automaticamente.

## Histórico

Cada abastecimento passa a guardar:

- `vehicle_km_reference`: KM usado como referência naquele lançamento;
- `distance_km`: diferença entre KM do abastecimento e referência;
- `diesel_average`: média calculada em km/L.

Dessa forma, editar o KM do veículo meses depois não altera a média histórica dos abastecimentos já gravados.

## Aplicação

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

Depois:

```bash
cd ..
npm install
npm run dev
```

Se executar a migration, não execute o SQL manual em `sql/AJUSTE_BANCO_MEDIA_KM_ABASTECIMENTOS.sql`.


## Regra atualizada de KM opcional

- O KM do abastecimento é opcional.
- Quando não informado, o abastecimento é salvo normalmente, a média fica em `0,00 km/L` e o `KM atual` do veículo não é alterado.
- Quando o KM informado é menor que o KM atual do veículo, o abastecimento também é salvo normalmente, a média fica em `0,00 km/L` e o hodômetro do cadastro não é reduzido.
- O KM atual do veículo só é atualizado quando o KM do abastecimento é maior ou igual ao KM atual.
- A média só utiliza uma distância válida quando `KM abastecimento >= KM de referência`.
