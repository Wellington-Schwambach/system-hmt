# Competência e resumo de abastecimentos

- Campo **Competência do faturamento** no cadastro/edição.
- Novos registros abrem com o mês atual e o usuário pode trocar o mês manualmente.
- Registros antigos recebem o mês da própria data do abastecimento.
- Resumo: Quantidade, Litros Diesel, R$ Diesel, Litros Arla, R$ Arla e R$ Total.
- Valores monetários começam ocultos e são exibidos pelo botão de olho.

## Aplicar

```bash
cd backend
php artisan optimize:clear
php artisan migrate

cd ..
npm install
npm run dev
```

Se executar a migration, não execute o SQL manual.
