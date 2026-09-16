# Ajuste de exibição das Notas do Dia e alertas

- Corrigida a consulta de destinatários das notas/alertas personalizados com EXISTS direto na tabela `daily_note_recipients`.
- Lembretes manuais com data futura passam a aparecer imediatamente após o cadastro e permanecem visíveis até a data; se vencerem sem conclusão, continuam como pendência até serem concluídos.
- Alertas personalizados continuam respeitando a antecedência configurada e permanecem visíveis após o vencimento enquanto estiverem pendentes.
- Removidos textos explicativos abaixo dos principais títulos da área de Alertas e notas e do modal de novo lembrete.
- Removida a descrição textual abaixo de cada tipo de alerta automático, mantendo a tela mais limpa.
- A consulta das notas manuais não é mais limitada ao mês/janela do Dashboard; a filtragem por data acontece após carregar as notas do destinatário.
- O endpoint do Dashboard agora envia cabeçalhos `no-store/no-cache` e o frontend força atualização do GET para evitar resposta antiga após salvar uma nota.
- O cadastro de lembrete passa a preencher explicitamente `note_type=manual`, `days_before=0` e `is_active=true` quando essas colunas existem.
- Removidos também textos introdutórios abaixo de outros títulos principais da tela Segurança.
