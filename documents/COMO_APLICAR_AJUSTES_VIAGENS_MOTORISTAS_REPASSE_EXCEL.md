# Ajustes da tela de Viagens

## Alterações

- Na listagem, quando há apenas um motorista, o nome completo continua sendo exibido.
- Quando há dois motoristas, cada nome é compactado para primeiro + último nome. O nome completo continua disponível nos dados e na exportação Excel.
- Fretes de terceiro ganharam o campo opcional **Data de repasse**.
- A tela de Viagens ganhou o botão **Exportar Excel**.
- A exportação respeita os filtros ativos e gera uma linha para cada CT-e, repetindo os dados comuns da viagem quando houver múltiplos CT-es.
- O Excel inclui rota, embarcador, operação, placa, motoristas, terceiro, valor/data de repasse, carreta de desengate, recebimento e todos os valores de cada CT-e.

## Aplicação

Como existe uma nova coluna no banco:

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

Se preferir atualização manual do PostgreSQL, use `sql/AJUSTE_BANCO_DATA_REPASSE_VIAGENS_TERCEIROS.sql` no lugar da migration. Não use os dois para a mesma alteração.
