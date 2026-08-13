# Cadastro de colaboradores e motoristas

## 1. Atualizar dependências

Na pasta principal do projeto:

```bash
npm install
```

Caso a pasta `backend/vendor` não exista:

```bash
cd backend
composer install
cd ..
```

## 2. Criar as tabelas

Forma recomendada:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

A migration cria:

- `employees`
- `employee_documents`

Não execute `AJUSTE_BANCO_CADASTRO_COLABORADORES.sql` se já executou a migration.

## 3. Iniciar o sistema

```bash
cd ..
npm run dev
```

Acesse **Cadastros > Colaboradores**.

## 4. O que testar

1. Cadastre um motorista com matrícula, CPF, nascimento e admissão.
2. Anexe CNH, ASO, toxicológico e ficha de registro.
3. Edite o cadastro e substitua um documento.
4. Remova um documento na edição e salve.
5. Baixe cada anexo pela listagem.
6. Pesquise pelo nome ou CPF e selecione um status.
7. Clique em **Exportar filtro** e confirme que o Excel contém somente os registros exibidos.
8. Exclua o colaborador e confirme a remoção do cadastro e dos anexos.

## 5. Armazenamento dos anexos

Os arquivos são privados e ficam em:

```text
backend/storage/app/private/employees/{id}/documents
```

Não é necessário executar `php artisan storage:link`. O download exige sessão válida,
horário permitido e permissão `registrations.employees`.

## 6. API

```text
GET    /api/employees
POST   /api/employees
POST   /api/employees/{employee}
DELETE /api/employees/{employee}
GET    /api/employees/{employee}/documents/{tipo}
```

Tipos de documento aceitos na URL:

```text
cnh
aso
toxicological
registration-form
```

## 7. Excel

O botão **Exportar filtro** gera um `.xlsx` com todos os campos do cadastro e os nomes
dos quatro anexos. A exportação usa exatamente os colaboradores visíveis após aplicar
pesquisa e filtro de status.
