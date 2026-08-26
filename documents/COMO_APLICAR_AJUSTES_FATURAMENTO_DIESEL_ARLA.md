# Ajustes da tela de Abastecimentos

## O que mudou

- Diesel e ARLA agora possuem faturamento independente.
- Status consolidado:
  - **Não faturado**: nenhum item faturado;
  - **Metade faturado**: abastecimento com Diesel + ARLA e apenas um deles faturado;
  - **Faturado**: todos os itens existentes no registro foram faturados.
- KM do abastecimento deixou de ser obrigatório. Sem KM, a listagem mostra `—` no KM e na média.
- Ao escolher a placa, o formulário mostra o **KM atual do veículo** cadastrado no módulo Veículos.
- O filtro de placas usa somente veículos do tipo `TRACTOR` cadastrados no PostgreSQL e permite selecionar várias placas.
- O filtro por composição foi substituído pelo filtro de faturamento.

## Ordem da listagem

1. Data
2. Placa
3. Posto
4. KM
5. Litros Diesel
6. Média
7. Valor Diesel
8. Faturar Diesel
9. Valor ARLA
10. Faturar ARLA
11. Motorista
12. Status
13. Editar

## API auxiliar

Foi criado:

`GET /api/fuel/options`

A rota usa a permissão `fuel` e retorna:

- cavalos ativos para novos abastecimentos;
- todas as placas cadastradas como cavalo para o filtro histórico;
- motoristas ativos.

Isso evita exigir que um usuário da tela de Combustível também tenha permissão administrativa de Veículos/Colaboradores.

## Banco

Não existe migration nova nesta atualização. O faturamento atual da tela de Combustível continua persistido na estrutura já utilizada pelo módulo, com compatibilidade automática para registros antigos.

## Aplicação

```bash
cd backend
php artisan optimize:clear
cd ..
npm install
npm run dev
```

No servidor, após atualizar o código:

```bash
cd backend
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```
