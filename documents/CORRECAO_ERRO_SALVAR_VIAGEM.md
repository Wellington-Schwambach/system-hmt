# Correção do erro ao salvar viagens

## Causa encontrada

O log do Laravel registrava:

```text
SQLSTATE[42P01]: relation "travel" does not exist
```

A migration criou a tabela correta, `travels`, mas o Eloquent inferia `travel` porque a palavra inglesa `travel` é tratada como incontável pelo pluralizador.

## Correção aplicada

No model `backend/app/Models/Travel.php` foi definido explicitamente:

```php
protected $table = 'travels';
```

A correção atende tanto viagens de frota própria quanto viagens de terceiros. Não é necessário executar migration ou SQL.

## Aplicação

Após atualizar o código:

```bash
cd backend
php artisan optimize:clear
cd ..
npm run dev
```

Em produção, reinicie o PHP-FPM depois de atualizar o código, caso utilize OPcache.
