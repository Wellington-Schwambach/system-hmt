# Atualização de validações e uploads amigáveis

Esta atualização não cria tabelas nem altera o banco de dados.

## O que foi corrigido

- Mensagens padrão de validação do Laravel em português (`backend/lang/pt_BR/validation.php`).
- Mensagens específicas para CNH, ASO, Toxicológico, Ficha de Registro e CRLV.
- `validation.uploaded` não é mais exibido ao usuário.
- Mensagens técnicas, SQL, stack trace e classes internas do PHP/Laravel são filtradas no frontend.
- Erros HTTP 500 exibem uma mensagem segura e amigável.
- Validação local de PDF/JPG/JPEG/PNG e arquivo vazio.
- Compatibilidade adicional com navegadores que identificam JPG como `image/jpg` ou não informam o MIME corretamente.
- Ambiente local iniciado por `npm run dev` com 12 MB por arquivo e 50 MB por requisição.

## Como aplicar

Na pasta principal:

```bash
npm install
npm run dev
```

Se `backend/vendor` não existir:

```bash
cd backend
composer install
cd ..
npm run dev
```

É importante reiniciar `npm run dev` depois da atualização para que os novos limites do PHP sejam aplicados.

## Limites de anexos

A aplicação aceita PDF, JPG/JPEG e PNG com até 10 MB por arquivo.

O servidor local é iniciado com:

- `upload_max_filesize=12M`
- `post_max_size=50M`
- `max_file_uploads=20`

O `post_max_size` é maior porque o cadastro de colaboradores pode enviar até quatro anexos na mesma requisição.

## Produção

Quando o sistema for publicado, confirme os mesmos limites na configuração do PHP do servidor. Se utilizar Nginx, o limite de corpo da requisição também deve ser configurado para comportar os anexos.

## Exemplos de mensagens

Em vez de:

`validation.uploaded`

O usuário verá algo como:

`Não foi possível enviar a ficha de registro. Use PDF, JPG ou PNG de até 10 MB e tente novamente.`

Em vez de uma exceção SQL ou stack trace, o usuário verá:

`A operação não pôde ser concluída agora.`

O detalhe técnico permanece disponível nos logs do Laravel para diagnóstico.
