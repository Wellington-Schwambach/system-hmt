# Módulo Conjuntos / Vincular Carretas

## Objetivo

A tela `/conjuntos` monta e acompanha conjuntos formados por:

- 1 cavalo ativo cadastrado em Veículos;
- 1 carreta ativa cadastrada em Veículos;
- 1 motorista principal ativo cadastrado em Colaboradores;
- opcionalmente, 1 segundo motorista no mesmo cavalo;
- data/hora do atrelamento cavalo + carreta;
- data/hora do vínculo do motorista.

## Regras principais

1. Um cavalo só pode participar de um conjunto ativo por vez.
2. Uma carreta só pode participar de um conjunto ativo por vez.
3. Cada motorista, principal ou segundo, só pode participar de um conjunto ativo por vez.
4. Apenas veículos `TRACTOR` entram no seletor de cavalos.
5. Apenas veículos `TRAILER` entram no seletor de carretas.
6. Apenas colaboradores ativos cujo cargo contenha `Motorista` entram no seletor de motoristas.
7. Trocas do motorista principal e vínculo/troca do segundo motorista não apagam o histórico anterior. Cada alteração gera um evento.
8. Desatrelar encerra o conjunto e libera cavalo, carreta e todos os motoristas vinculados para novas combinações.
9. Veículo ou motorista de um conjunto ativo não pode ser excluído pelos cadastros.
10. Cada ação registra o usuário autenticado responsável.
11. O histórico pode ser exportado para Excel respeitando os filtros de placa e período aplicados na tela.

## Banco

A migration cria:

- `vehicle_sets`: estado atual do conjunto;
- `vehicle_set_events`: histórico imutável das ações operacionais.

Os snapshots de placa/nome são mantidos no histórico, então registros antigos continuam legíveis mesmo que cadastros sejam removidos no futuro.

## APIs

Todas exigem autenticação, horário válido e permissão `vehicle_sets`.

- `GET /api/vehicle-sets/options`
- `GET /api/vehicle-sets`
- `POST /api/vehicle-sets`
- `PUT /api/vehicle-sets/{id}/driver`
- `POST /api/vehicle-sets/{id}/detach`

## Permissão

Foi adicionada a permissão:

`vehicle_sets` → **Conjuntos de veículos**

Ela aparece na tela Segurança. Administradores têm acesso total, e a migration também acrescenta a permissão aos perfis operacionais existentes que já tinham acesso a Viagens ou Logística.

## Como aplicar

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

No servidor:

```bash
cd /var/www/system-hmt/backend
php artisan optimize:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

## SQL manual

Se não utilizar migrations, existe o arquivo:

`sql/AJUSTE_BANCO_CONJUNTOS_VINCULO_CARRETAS.sql`

Não execute o SQL manual e a migration para o mesmo ambiente.

## Teste recomendado

1. Cadastre/tenha 2 cavalos, 2 carretas e 2 motoristas ativos.
2. Abra Conjuntos.
3. Monte cavalo A + carreta A + motorista A e, opcionalmente, motorista B como segundo motorista.
4. Verifique se todos os recursos vinculados somem das opções disponíveis.
5. Abra o conjunto ativo e teste a troca do motorista principal ou o vínculo/troca do segundo motorista.
6. Verifique o histórico com usuário/data/hora e teste a exportação Excel.
7. Desatrele o conjunto.
8. Verifique se cavalo, carreta e os motoristas vinculados voltaram às opções.
