# Ajustes da Logística - 15/09/2026

## Cadastro de cargas
- Conteúdo visual do formulário em letras maiúsculas.
- Campos de texto digitados pelo formulário são normalizados para maiúsculas durante a edição.
- Observação existente passou a representar a observação da origem.
- Adicionado campo separado de observação do destino.

## Listagem diária
Nova ordem das colunas:
1. Embarcador
2. Origem
3. Observação
4. Destino
5. Observação
6. Hora carregamento
7. Armador
8. Coleta
9. Baixa
10. Tipo container
11. Status viagem
12. Ações

- Removida a coluna Grade de carregamento.
- Removida a coluna Etapa da listagem.
- Tipo de container passa a aparecer diretamente na listagem.

## Duplicar
- Criado modo explícito "Duplicar carga".
- Mantida a regra de não copiar agendamentos nem histórico de status.
- O embarcador é preservado e, quando a duplicação parte de uma data selecionada no calendário, a data do carregamento segue a data selecionada.

## Barra horizontal
- A barra nativa escondida foi substituída por um controle visual fixo no rodapé do viewport.
- O controle tem trilho, puxador verde e indicação "ARRASTE".
- A rolagem vertical continua sendo exclusivamente a rolagem normal da página.

## Banco
- Adicionada a coluna `destination_notes` em `logistics_loads` para manter a observação do destino separada da observação de origem.
- Migration: `2026_09_15_210000_add_destination_notes_to_logistics_loads_table.php`.
- SQL manual: `sql/AJUSTE_BANCO_OBSERVACAO_DESTINO_LOGISTICA_20260915.sql`.
