# Abastecimentos vinculados ao PostgreSQL

## O que mudou

A tela de Abastecimentos deixou de usar o `localStorage` como fonte oficial. Agora cadastro, edição, faturamento de Diesel, faturamento de ARLA e exclusão passam pela API Laravel e são persistidos na tabela `fuel_records`.

Também foram ajustados os ícones do modal: eles ficam centralizados dentro do campo e não invadem os textos auxiliares abaixo dos inputs.

## Auditoria gravada

Cada abastecimento registra:

- usuário que cadastrou (`created_by`);
- último usuário que editou (`updated_by`);
- usuário que faturou Diesel (`diesel_invoiced_by` + data/hora);
- usuário que faturou ARLA (`arla_invoiced_by` + data/hora);
- usuário que excluiu (`deleted_by` + `deleted_at`).

A exclusão é lógica (`SoftDeletes`), portanto o histórico permanece no banco.

## Vínculos

Novos abastecimentos exigem:

- cavalo ativo cadastrado em `vehicles`;
- motorista ativo cadastrado em `employees`.

A placa e o nome do motorista também são preservados como snapshot no abastecimento.

## Registros antigos do navegador

Na primeira abertura após a migration, se `fuel_records` estiver vazia e houver registros antigos no `localStorage`, o sistema tenta importá-los automaticamente para o PostgreSQL. Só são importados registros cuja placa corresponda a um cavalo cadastrado.

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

No servidor de produção:

```bash
cd backend
php artisan optimize:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

Não execute `sql/AJUSTE_BANCO_ABASTECIMENTOS_COMPLETO.sql` caso tenha usado `php artisan migrate`.

## API

- `GET /api/fuel`
- `GET /api/fuel/options`
- `POST /api/fuel`
- `PUT /api/fuel/{id}`
- `PATCH /api/fuel/{id}/invoice`
- `DELETE /api/fuel/{id}`
- `POST /api/fuel/import-legacy` (migração automática de registros antigos)
