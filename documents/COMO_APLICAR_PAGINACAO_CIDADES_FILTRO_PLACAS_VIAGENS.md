# Atualização da tela de Viagens

Esta versão adiciona paginação, busca de cidades em Origem/Destino, período compacto em dd/mm e corrige o filtro de placas para usar somente cavalos cadastrados em Veículos.

## O que mudou

- Paginação da listagem com 10, 25 ou 50 viagens por página.
- Resumo e Excel continuam considerando todos os registros do filtro, não apenas a página atual.
- Origem e Destino agora usam o combobox pesquisável de cidades brasileiras.
- As cidades são exibidas no formato `Cidade / UF`.
- O filtro de período aceita `dd/mm`, por exemplo `01/08` até `31/08`.
- O filtro de placa usa somente veículos com `type = TRACTOR` cadastrados na tabela `vehicles`.
- Placas de terceiros e carretas não aparecem mais no filtro.

## Banco de dados

Não há migration nova nesta atualização.

A busca de cidades reutiliza as tabelas já existentes:

- `brazil_states`
- `brazil_cities`

Se essas tabelas ainda não existirem no ambiente, aplique as migrations anteriores do cadastro de colaboradores.

## Aplicação

Na raiz do projeto:

```bash
npm install
npm run dev
```

No servidor, após o push:

```bash
cd backend
php artisan optimize:clear
```

Não é necessário executar uma migration específica desta atualização.
