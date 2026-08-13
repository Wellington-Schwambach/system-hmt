# Alteração de senha pelo próprio usuário

## O que foi adicionado

- Modal aberto pelo item `Configurações > Alterar senha`.
- Campos de senha atual, nova senha e confirmação.
- Botões para mostrar ou ocultar as senhas.
- Validação da senha atual no Laravel.
- Nova senha com no mínimo 8 caracteres, letras maiúsculas e minúsculas e número.
- Gravação automática com hash pelo model `User`.
- Permanência da sessão atual após a troca.
- Limpeza do `remember_token` para invalidar acessos lembrados anteriormente.

## API

```text
PUT /api/auth/password
```

Payload:

```json
{
  "current_password": "SenhaAtual@123",
  "password": "NovaSenha@456",
  "password_confirmation": "NovaSenha@456"
}
```

Resposta de sucesso:

```json
{
  "message": "Senha alterada com sucesso."
}
```

## Como aplicar

Não existe alteração de banco ou migration para esta atualização.

Na pasta principal:

```bash
npm install
```

Caso a pasta `backend/vendor` não exista:

```bash
cd backend
composer install
cd ..
```

Inicie o projeto:

```bash
npm run dev
```

## Teste manual

1. Entre no sistema.
2. Abra `Configurações` no header.
3. Clique em `Alterar senha`.
4. Informe a senha atual.
5. Informe e confirme a nova senha.
6. Clique em `Alterar senha`.
7. Saia do sistema e faça login com a nova senha.

Os itens `Atualizar cadastro` e `Preferências` continuam comentados.
