# Ajustes de Viagens, Colaboradores, Embarcadores e Conjuntos

## Alterações

### Viagens
- Valores financeiros dos cards iniciam ocultos e podem ser exibidos pelo botão com ícone de olho.
- Placa e Embarcador agora usam filtro múltiplo com checkbox, pesquisa e opção de selecionar todos.
- CT-e `DAILY` passa a seguir a regra operacional do Complemento: isolado não exige motorista e não conta como uma nova viagem no card Total de viagens.
- Se houver CT-e `NORMAL` no mesmo lançamento, o motorista volta a ser obrigatório e o lançamento conta como uma viagem.
- Complemento e Diária exigem o campo **CT-e original**, usando a mesma referência gravada no lançamento.

### Colaboradores
- Férias passam a ser calculadas como `Data de admissão + 1 ano`.
- A migration recalcula os colaboradores já existentes.

### Embarcadores
- Novo campo `Prazo de recebimento (dias)`, por exemplo 45.
- Documentos/manuais dinâmicos: cada linha possui nome/descrição e arquivo.
- Formatos: PDF, JPG, PNG, Word ou Excel, até 10 MB por arquivo.
- Documentos existentes podem ser renomeados, baixados ou removidos.
- Os arquivos ficam no storage privado do Laravel em `storage/app/private/shippers/{id}/documents`.

### Conjuntos
- Histórico ganhou filtro por placa do cavalo.
- Histórico ganhou período De/Até.
- A filtragem considera todo o histórico carregado, não apenas a página atual.

## Aplicação

Na pasta `backend`:

```bash
php artisan optimize:clear
php artisan migrate
```

Depois, na raiz:

```bash
npm install
npm run dev
```

Em produção:

```bash
cd backend
php artisan optimize:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

Não execute o SQL manual se as migrations já tiverem sido executadas.
