# Ajustes no cadastro de colaboradores

## Alterações

- Corrigida a busca da listagem. Antes, uma busca textual podia coincidir com todos os CPFs porque a sequência de dígitos vazia era considerada encontrada.
- O filtro inicia sempre em **Ativos**.
- Ao inativar um colaborador, ele deixa automaticamente a visualização padrão e passa a aparecer ao selecionar **Inativos**.
- O filtro continua permitindo visualizar Ativos, Afastados, Inativos ou Todos.
- **Fim da experiência 45 dias** é calculado pela data de admissão + 45 dias.
- **Fim da experiência + 45 dias** é calculado pela data de admissão + 90 dias.
- **Férias** é calculado pela data de admissão + 1 ano e 10 meses.
- As três datas calculadas são gravadas no PostgreSQL e retornadas pela API.
- A exportação Excel inclui as novas datas.

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

Não execute o arquivo `sql/AJUSTE_BANCO_EXPERIENCIA_FERIAS_COLABORADORES.sql` caso tenha executado `php artisan migrate`.
