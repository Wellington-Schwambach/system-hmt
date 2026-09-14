# Ajuste - Agendamento de coleta

- Removido o preenchimento automático da data de agendamento da coleta ao abrir um novo cadastro pelo calendário.
- O campo `Data do agendamento` passa a iniciar vazio e só recebe uma data quando o usuário informar manualmente.
- A abertura do cadastro em um dia selecionado no calendário não transfere mais aquela data para o agendamento.
- A regra de duplicação foi preservada: quando a carga original possui data de agendamento, ela continua sendo mantida na duplicação, conforme regra já definida anteriormente.

Validação executada:
- TypeScript + Vite (`npm run build`): OK.
- ESLint do arquivo alterado: OK.
