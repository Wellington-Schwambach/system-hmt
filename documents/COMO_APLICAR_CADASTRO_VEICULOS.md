# Cadastro de Veículos - Aplicação e validação

## 1. Atualizar dependências

Na pasta principal do projeto:

```bash
npm install
```

Na pasta do backend:

```bash
cd backend
composer install
```

## 2. Criar a tabela no PostgreSQL

Ainda em `backend`:

```bash
php artisan optimize:clear
php artisan migrate
```

A migration criada é:

```text
database/migrations/2026_08_06_210000_create_vehicles_table.php
```

O arquivo `AJUSTE_BANCO_CADASTRO_VEICULOS.sql` é uma alternativa manual. Não execute o SQL se já tiver executado `php artisan migrate`.

## 3. Iniciar o projeto

Volte à pasta principal:

```bash
cd ..
npm run dev
```

Acesse **Cadastros > Veículos**.

## 4. O que foi implementado

- Cadastro real no PostgreSQL.
- Edição completa.
- Exclusão do registro e do CRLV armazenado.
- Placa, número de frota, chassi e RENAVAM com validação de duplicidade.
- Tipos Cavalo e Carreta.
- KM atual, vencimentos Opentech e Angellira e licenciamento.
- Capacidade e tara.
- Upload de CRLV em PDF, JPG ou PNG, até 10 MB.
- Data de vigência do CRLV.
- Download protegido do CRLV.
- Exportação em arquivo Excel `.xlsx` usando as colunas solicitadas.

## 5. Onde o CRLV é armazenado

O arquivo fica no disco privado do Laravel:

```text
backend/storage/app/private/vehicles/crlv
```

Não é necessário executar `php artisan storage:link`. O arquivo só é entregue pela API depois de validar sessão, horário e permissão de Veículos.

## 6. Rotas da API

Todas exigem:

- sessão autenticada;
- usuário dentro do horário ou com liberação temporária;
- permissão `registrations.vehicles`.

```text
GET    /api/vehicles
POST   /api/vehicles
POST   /api/vehicles/{id}
DELETE /api/vehicles/{id}
GET    /api/vehicles/{id}/crlv
```

Os cadastros e edições usam `multipart/form-data` para permitir o envio do arquivo.

## 7. Teste manual recomendado

1. Cadastre um Cavalo com placa, número de frota, KM, anos, RENAVAM e chassi.
2. Anexe um PDF de CRLV e informe a vigência.
3. Confira o registro na listagem.
4. Baixe o CRLV pelo ícone de documento.
5. Edite KM, licenciamento e vencimentos.
6. Substitua ou remova o CRLV e salve.
7. Exporte a listagem e abra o arquivo `.xlsx` no Excel.
8. Exclua o veículo e confirme que ele desaparece da listagem.

## 8. Colunas da listagem

- N° Frota
- Placa
- Tipo
- KM atual
- Vencimento Opentech
- Vencimento Angellira
- Ano
- RENAVAM
- Chassi
- Licenciamento

## 9. Colunas exportadas

- Placa
- Marca
- Modelo
- Ano fabricação
- Ano modelo
- Cor
- Chassi
- RENAVAM
- Capacidade
- Tara
