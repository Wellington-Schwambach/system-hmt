# Notas do dia — 15/09/2026

## Dashboard

- O card **Notas do dia** deixou de usar dados fixos.
- Alertas automáticos são calculados conforme os cadastros atuais do sistema e as preferências do usuário:
  - vencimentos de veículos: padrão 10 dias antes;
  - vencimentos de colaboradores: padrão 10 dias antes;
  - aniversários: padrão 5 dias antes;
  - fim da experiência e prorrogação: padrão 10 dias antes;
  - férias: padrão 15 dias antes.
- Veículos considerados: Licenciamento, Tacógrafo, CRLV, Opentech e Angellira.
- Colaboradores considerados: CNH, ASO, Toxicológico, Opentech e Angellira.
- O botão **+** permite criar lembretes manuais com:
  - título;
  - observação;
  - data opcional;
  - horário opcional;
  - usuários destinatários.
- Lembrete sem data permanece no card diariamente para os destinatários.
- Lembrete com data aparece no dia informado.
- Clique em uma nota abre um modal com a observação completa.
- O autor ou um administrador pode excluir um lembrete manual.

## Calendário do Dashboard

- Datas que possuem notas/vencimentos recebem um indicador próprio.
- Ao clicar no dia, o modal mostra primeiro **Notas e vencimentos** e depois as cargas daquela data.
- O evento é mostrado no calendário exatamente na data real cadastrada do vencimento/aniversário/experiência/férias.

## Segurança > Alertas e notas

- Nova aba **Alertas e notas**.
- Configuração individual por usuário.
- Cada tipo de alerta pode ser habilitado/desabilitado.
- A antecedência pode ser alterada entre 0 e 365 dias por usuário e por tipo de alerta.
- A estrutura usa tipos de alerta independentes, facilitando adicionar Manutenção futuramente sem refazer o módulo.

## Banco

Novas tabelas:

- `daily_note_preferences`
- `daily_notes`
- `daily_note_recipients`

Migrations:

- `2026_09_15_234000_create_daily_note_preferences_table.php`
- `2026_09_15_234100_create_daily_notes_tables.php`

SQL manual alternativo:

- `sql/AJUSTE_BANCO_NOTAS_DO_DIA_20260915.sql`

Use as migrations **ou** o SQL manual, não os dois.

## Complemento — alertas personalizados

- Adicionado gerenciamento de **Alertas personalizados** em Segurança > Alertas e notas.
- Cada alerta personalizado possui:
  - nome;
  - observação/mensagem editável;
  - data e horário de referência;
  - antecedência de 0 a 365 dias;
  - status Ativo/Pausado;
  - destinatários específicos.
- Alertas personalizados podem ser criados, editados, pausados e excluídos sem alteração de código.
- Durante o período de antecedência, o alerta aparece nas **Notas do dia** para os destinatários selecionados.
- A data de referência continua marcada no calendário do Dashboard.
- As cargas foram removidas do calendário do Dashboard. O card mensal de Cargas continua disponível apenas como indicador e atalho para o calendário de Logística.

### Banco

Nova migration:

`backend/database/migrations/2026_09_15_235500_enhance_daily_notes_for_custom_alerts.php`

SQL manual equivalente:

`backend/database/sql/AJUSTE_BANCO_ALERTAS_PERSONALIZADOS_20260915.sql`

## Complemento — check de conclusão

- Toda Nota do dia/alerta exibido no Dashboard agora pode ser marcado como **Concluído**.
- O check funciona também para alertas automáticos (vencimentos, aniversários, experiência e férias), lembretes manuais e alertas personalizados.
- Ao concluir:
  - a nota permanece visível;
  - a borda e o fundo recebem destaque verde;
  - fica registrado quem concluiu e em qual data/hora.
- O check pode ser desmarcado para retornar a nota ao estado **Pendente**.
- A conclusão é compartilhada: quando um usuário conclui um alerta que também é exibido para outros usuários, todos visualizam o mesmo estado concluído.
- Ao editar um alerta personalizado, a conclusão anterior é limpa para que o alerta atualizado volte a ficar pendente.

### Banco

Nova tabela:

- `daily_note_completions`

Migration:

`backend/database/migrations/2026_09_15_235700_create_daily_note_completions_table.php`

SQL manual equivalente:

`backend/database/sql/AJUSTE_BANCO_CHECK_NOTAS_DO_DIA_20260915.sql`
