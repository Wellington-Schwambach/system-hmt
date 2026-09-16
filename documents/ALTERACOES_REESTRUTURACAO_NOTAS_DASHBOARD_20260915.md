# Reestruturação de Notas do Dia / Alertas do Dashboard — 15/09/2026

## Objetivo

Revisão completa do fluxo de Notas do Dia e Alertas personalizados após os alertas automáticos funcionarem, mas notas/lembretes e alertas criados no banco não aparecerem de forma confiável no Dashboard.

## Backend

- A leitura de notas gravadas deixou de depender de eager loading/relacionamentos Eloquent para decidir visibilidade.
- A consulta agora parte diretamente de `daily_note_recipients`, usando o usuário autenticado como regra única de destinatário.
- Compatibilidade mantida com banco antes/depois das colunas `note_type`, `days_before` e `is_active`.
- Notas excluídas logicamente são ignoradas.
- Alertas pausados não entram no Dashboard.
- Lembretes manuais aparecem imediatamente para seus destinatários.
- Alertas personalizados respeitam a antecedência configurada.
- Alertas personalizados vencidos permanecem pendentes até a conclusão.
- Calendário continua mostrando a data real do evento dentro do mês.
- Criação de notas e alertas + destinatários passou a ser transacional.
- Edição de alerta + troca de destinatários + limpeza de conclusão passou a ser transacional.
- Exclusões removem conclusão e nota dentro da mesma transação.
- Alertas personalizados são gerenciados pela tela de Segurança; a exclusão pelo modal do Dashboard fica reservada aos lembretes manuais.
- Tela de Segurança ganhou proteções para migrations pendentes sem derrubar a visão geral inteira.

## Reparo de dados antigos

Migration adicionada:

`2026_09_15_235900_repair_daily_note_recipients.php`

Ela procura notas antigas que não possuem nenhum destinatário e adiciona o criador da nota como destinatário de recuperação.

SQL manual equivalente:

`backend/database/sql/AJUSTE_BANCO_REPARO_DESTINATARIOS_NOTAS_20260915.sql`

## Frontend

- Dashboard atualiza dados a cada 60 segundos enquanto estiver visível, além da atualização ao retornar para a aba/janela.
- Mantida atualização imediata depois de criar/concluir/excluir lembrete no próprio Dashboard.
- Textos explicativos extras da área de alertas foram removidos; a interface fica centrada nos títulos, campos e dados.
- Removida duplicidade de `is_active` na tipagem de usuário de Segurança.

## Revisão geral adicional

O lint completo do frontend tinha dois erros antigos fora do módulo de notas. Ambos foram corrigidos:

- import não utilizado de `CalendarDays` em `navigation/constants.ts`;
- carregamento síncrono dentro de `useEffect` em `BI/hooks.ts`.

Com isso, o lint completo do frontend volta a passar sem erros.
