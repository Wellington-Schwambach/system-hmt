# Cadastro de viagens - API e PostgreSQL

## 1. O que foi alterado

A tela de Viagens deixou de usar `localStorage` como fonte oficial e passou a gravar no PostgreSQL pela API Laravel.

Campos do cadastro:

- Tipo do CT-e: Normal ou Complemento de frete. Normal é o padrão.
- Data da viagem.
- Origem e destino.
- Número do CT-e.
- Série do CT-e.
- Embarcador.
- Frete líquido.
- Seguro.
- Pedágio.
- ICMS.
- Frete bruto calculado automaticamente.
- Frota própria com até dois motoristas; ou terceiro contratado com placa e valor de repasse.
- Data de recebimento do frete.
- Carreta de desengate opcional.

Regra financeira:

```text
Frete bruto = Frete líquido + Seguro + Pedágio + ICMS
```

Se Seguro, Pedágio e ICMS forem zero, o frete bruto espelha o frete líquido.

## 2. Atualizar o banco

Na pasta do backend:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

A migration criada é:

```text
2026_08_13_090000_create_travels_table.php
```

Se preferir executar SQL manualmente no PostgreSQL, use:

```text
AJUSTE_BANCO_CADASTRO_VIAGENS.sql
```

Use migration OU SQL manual. Não use os dois para criar a mesma tabela.

## 3. Iniciar

Na pasta principal:

```bash
npm install
npm run dev
```

## 4. API

```text
GET    /api/travels/options
GET    /api/travels
POST   /api/travels
PUT    /api/travels/{id}
DELETE /api/travels/{id}
```

Todas exigem:

- sessão autenticada;
- horário permitido;
- sessão não expirada;
- permissão `travel`.

`GET /api/travels/options` retorna apenas:

- cavalos ativos;
- carretas ativas;
- colaboradores ativos cujo cargo contenha `Motorista`.

## 5. Cálculo seguro

O frontend mostra o frete bruto em tempo real, mas o valor salvo não é confiado ao navegador.
O Laravel recalcula o bruto antes de gravar no banco. Dessa forma, alterações manuais no JavaScript não alteram a regra financeira.

## 6. Terceiro contratado

Ao selecionar `Terceiro contratado`:

- não é necessário selecionar veículo ou motorista da frota;
- nome do terceiro é obrigatório;
- placa utilizada é obrigatória;
- valor de repasse é obrigatório;
- o repasse não entra no cálculo do frete bruto, pois representa o valor pago ao terceiro.

## 7. Desengate

O campo de carreta é opcional e lista apenas veículos cadastrados como `Carreta` e ativos.

## 8. Grid principal

Colunas exibidas:

- Data
- Placa
- Origem
- Destino
- Frete líquido
- Frete bruto
- Motorista / Terceiro
- Embarcador
- Data de recebimento
- Ações

A diferença não aparece no grid.

## 9. Quadro de diferença

O card `Diferença` mostra o total de complementos e separa:

- ICMS
- Seguro
- Pedágio

## 10. Compatibilidade temporária com BI e Acertos

A API/PostgreSQL é a fonte oficial. Depois que as viagens são carregadas, o frontend mantém um cache auxiliar no `localStorage` para os módulos BI e Acertos atuais continuarem lendo as viagens enquanto eles ainda não usam API própria.

## 11. Testes recomendados

1. Cadastre uma viagem normal da frota com apenas frete líquido e confirme bruto = líquido.
2. Adicione Seguro, Pedágio e ICMS e confira a soma do bruto.
3. Cadastre com dois motoristas.
4. Cadastre um frete de terceiro com repasse.
5. Cadastre com carreta de desengate.
6. Edite os valores e confirme o recálculo.
7. Tente repetir número + série do CT-e e confirme a mensagem de duplicidade.
8. Informe recebimento anterior à viagem e confirme a validação amigável.
9. Exclua uma viagem e confirme a remoção.
10. Confira o card Diferença e o grid principal.
