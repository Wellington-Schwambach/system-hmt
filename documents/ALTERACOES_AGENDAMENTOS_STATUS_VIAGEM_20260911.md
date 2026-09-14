# Ajustes de agendamentos e status da viagem - 11/09/2026

## Cadastro da carga
- Somente o embarcador permanece como campo obrigatório.
- O cadastro normal da carga não envia nem sobrescreve agendamentos de coleta/baixa.
- O antigo bloco manual "Agendar coleta" foi removido do cadastro.
- Local da coleta passou a ser digitável, no mesmo padrão do Local da baixa.
- As demais informações operacionais continuam opcionais.

## Agendamentos de coleta e baixa
- Agendamentos são salvos por endpoint próprio, separados do cadastro da carga.
- Cada agendamento aceita Data/Hora, Local digitável e Tipo do local.
- Os botões da listagem não usam mais "Sim/Não" e mostram um botão maior com a quantidade de horários ou a ação "Agendar".

## Status da viagem
- Nova coluna "Status viagem" na listagem diária.
- O modal permite adicionar uma observação.
- Cada observação fica vinculada à carga e ao usuário que a cadastrou.
- O histórico mostra usuário, data/hora e observação.

## Banco de dados
Executar a migration:

`2026_09_11_230000_create_logistics_load_status_notes_table.php`

Alternativamente, executar:

`sql/AJUSTE_BANCO_STATUS_VIAGEM_LOGISTICA_20260911.sql`

Use apenas uma das opções.
