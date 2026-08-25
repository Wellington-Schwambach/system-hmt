# Ajustes no cadastro de veículos

Foram adicionados:

- Vencimento do tacógrafo no cadastro/edição;
- tipo de veículo **Outros**;
- filtro por final da placa (0 a 9), útil para organização de IPVA;
- paginação na listagem, com 10, 25 ou 50 itens por página.

## Aplicação

```bash
cd backend
php artisan optimize:clear
php artisan migrate
cd ..
npm install
npm run dev
```

Não execute o SQL manual se utilizar `php artisan migrate`.

O filtro e a paginação são apenas de interface e não exigem alteração adicional no banco.
