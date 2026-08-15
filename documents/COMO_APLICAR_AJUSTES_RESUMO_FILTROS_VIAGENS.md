# Ajustes da listagem de Viagens

Esta atualização é somente de frontend. Não cria tabelas, não altera colunas e não exige migration/SQL.

## Alterações

1. O card **Diferença** ficou mais compacto: ICMS, Seguro e Pedágio aparecem ao lado do valor principal.
2. O grid de Viagens ganhou a coluna **Nº CT-e** logo após **Frete bruto**.
3. Os cards superiores agora respeitam todos os filtros aplicados na listagem:
   - Placa
   - Embarcador
   - Tipo de CT-e
   - Período
   - Busca textual
4. Foi criado o filtro **Período**, com Data inicial e Data final, usando a data da viagem.
5. Quando o filtro de Tipo de CT-e estiver em Normal ou Complemento, os valores dos cards consideram somente os CT-es daquele tipo dentro das viagens exibidas.

## Como aplicar

Na raiz do projeto:

```bash
npm install
npm run dev
```

Não é necessário executar `php artisan migrate` para esta atualização.

## Testes rápidos

- Selecione um embarcador, por exemplo Aurora. O total de viagens, frete líquido, frete bruto, diferença, ICMS, Seguro e Pedágio devem passar a considerar somente os registros exibidos.
- Selecione uma placa e confirme o mesmo comportamento.
- Escolha Normal ou Complemento e confira os valores.
- Informe Data inicial e Data final. O período é inclusivo nas duas pontas.
- Confira a nova coluna Nº CT-e após Frete bruto.
