# Ajustes de CT-e em Viagens

- Total de viagens não contabiliza viagens que tenham somente CT-es de Complemento.
- Complemento de frete em frota própria não exige motorista; o cavalo continua obrigatório.
- Complemento exige informar o número do CT-e original em **CT-e complementado**.
- O tipo **Diária** está disponível no cadastro e no filtro.
- O Excel inclui o campo **CT-e complementado**.

## Aplicar

```bash
cd backend
php artisan optimize:clear
php artisan migrate
cd ..
npm install
npm run dev
```

Não execute o SQL manual se utilizar `php artisan migrate`.
