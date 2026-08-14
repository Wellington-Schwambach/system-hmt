# Ajuste do filtro de período para dd/mm/aaaa

O filtro de período da tela de Viagens foi alterado para exibir e receber datas no padrão brasileiro `dd/mm/aaaa`.

## Comportamento

- Digitação numérica com máscara automática.
- Exemplo: `01082026` vira `01/08/2026`.
- A data só é aplicada ao filtro quando estiver completa e válida.
- Internamente o sistema mantém `yyyy-mm-dd`, preservando as comparações e filtros existentes.
- Não há alteração de banco ou migration.

## Aplicação

Na raiz do projeto:

```bash
npm install
npm run dev
```
