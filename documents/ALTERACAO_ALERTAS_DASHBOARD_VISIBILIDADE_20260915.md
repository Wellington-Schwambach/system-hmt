# Correção — Alertas personalizados no Dashboard

- Alertas personalizados e alertas automáticos agora são montados de forma independente. Uma falha em vencimentos de veículos/colaboradores não zera os alertas personalizados.
- A busca dos destinatários dos alertas personalizados passou a usar diretamente a tabela `daily_note_recipients`, evitando dependência de alias do relacionamento Eloquent.
- Alertas personalizados ativos são considerados pela regra de antecedência independentemente do recorte usado para os alertas automáticos.
- Um alerta personalizado vencido e ainda não concluído continua aparecendo nas Notas do dia até ser marcado como concluído.
- Alertas personalizados concluídos deixam de permanecer como pendência depois da data.
- O texto auxiliar no card agora informa `vence hoje`, `vence amanhã`, `em X dias` ou `vencido há X dias` também para alertas personalizados.
- Falhas no módulo de conclusão são isoladas e não fazem as notas desaparecerem.

Não há migration nova nesta correção.
