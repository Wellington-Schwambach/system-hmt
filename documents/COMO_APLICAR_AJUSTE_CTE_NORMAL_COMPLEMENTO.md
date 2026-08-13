# Ajuste de viagens: CT-e Normal e Complemento

- Tipos disponíveis: **Normal** e **Complemento de frete**.
- **Diária** foi removida.
- **Bonificação** foi removida do cadastro e do resumo.
- Frete bruto = Frete líquido + Seguro + Pedágio + ICMS.
- O aviso parcial de cadastros auxiliares foi removido da tela.

## Aplicar

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

Não execute o SQL manual se rodar as migrations.
