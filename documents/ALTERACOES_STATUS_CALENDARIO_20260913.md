# Ajustes de Logística — 13/09/2026

## Status da viagem
- Adicionada visibilidade por observação (`Exibir` / `Não exibir`).
- Os controles de visibilidade aparecem somente para usuários com perfil `Administrador`.
- Observações marcadas como `Não exibir` não são retornadas pela API para usuários não administradores.
- Usuários comuns podem cadastrar observações, mas não podem ocultá-las.
- Administradores podem alterar a visibilidade de observações já cadastradas.

## Calendário
- Coluna de domingo reduzida.
- Domingo mostra somente `DOM` e o número da data, sem os blocos de agendamento/carregamento.
- Tipografia do calendário ampliada para facilitar leitura.

## Listagem diária
- Tipografia ampliada.
- Nova coluna `Etapa`, com Programação, Coleta, Carregando ou Baixa.
- Agendamento de coleta identificado explicitamente como `Coleta agendada`.
- Agendamento de baixa identificado explicitamente como `Baixa agendada`.

## Banco de dados
Migration:
`backend/database/migrations/2026_09_13_200000_add_visibility_to_logistics_load_status_notes_table.php`

Alternativa manual:
`sql/AJUSTE_BANCO_VISIBILIDADE_STATUS_VIAGEM_20260913.sql`
