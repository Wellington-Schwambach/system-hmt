# Alertas visuais e confirmações

Esta atualização substitui os alertas nativos do navegador por um sistema visual próprio, integrado ao tema claro e escuro do HMT Transportes.

## O que foi alterado

- Toasts de sucesso, erro, aviso e informação no canto superior direito.
- Barra visual indicando o tempo restante da notificação.
- Fechamento manual da notificação.
- Modal central para confirmações importantes.
- Fundo escurecido e desfocado nas confirmações.
- Leitura padronizada dos erros retornados pelo Laravel.
- Erros HTTP 401, 403, 404, 409, 413, 419, 422, 423, 429, 500 e 503 tratados com mensagens amigáveis.
- Erros de validação 422 exibem uma lista dos campos que precisam ser corrigidos.
- Remoção dos `window.alert` e `window.confirm` do frontend.

## Fluxos atualizados

- Login e sessão expirada.
- Alteração de senha.
- Cadastro, edição, exclusão e download de veículos.
- Cadastro, edição, exclusão e download de documentos de colaboradores.
- Cadastro de usuários e liberação de acesso na tela Segurança.
- Confirmação de faturamento de combustível.
- Confirmações do módulo de acertos.
- Exportações Excel.
- Logout.

## Como aplicar

Não existe alteração de banco ou migration nesta versão.

Na pasta principal do projeto:

```bash
npm install
npm run dev
```

Caso a pasta `backend/vendor` não exista:

```bash
cd backend
composer install
cd ..
npm run dev
```

## Arquivos principais

- `src/contexts/Notifications/`: provider, toasts e modal de confirmação.
- `src/utils/apiError.ts`: tradução dos retornos de erro do Laravel.
- `src/main.tsx`: registro global do provider.

## Exemplo de uso

```tsx
const notifications = useNotifications();

notifications.success('Cadastro concluído', 'O registro foi salvo com sucesso.');
notifications.error('Não foi possível salvar', 'Confira os dados enviados.');

const confirmed = await notifications.confirm({
  title: 'Excluir registro?',
  message: 'Esta operação não poderá ser desfeita.',
  type: 'error',
  confirmLabel: 'Excluir',
});
```
