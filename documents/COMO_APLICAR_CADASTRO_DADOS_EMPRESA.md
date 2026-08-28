# Cadastro de Dados da Empresa

Foi adicionado o menu **Cadastros > Empresa** com dados cadastrais, fiscais, contatos, endereço, responsável legal, observações e documentos.

## Banco de dados

Execute no backend:

```bash
php artisan optimize:clear
php artisan migrate
```

A migration `2026_08_28_235000_create_company_profile_and_documents.php` cria:

- `company_profiles`
- `company_documents`
- permissão `registrations.company` para usuários que já possuíam acesso aos cadastros operacionais.

Os documentos são armazenados no disco local do Laravel em `company/{id}/documents` e aceitam PDF, JPG, PNG, Word e Excel de até 10 MB.
