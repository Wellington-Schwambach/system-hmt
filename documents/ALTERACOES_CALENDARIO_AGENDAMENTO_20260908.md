# Ajustes de Logística - 08/09/2026

- Booking de baixa recolocado no bloco **Baixa / Entrega** do cadastro.
- Data de agendamento da coleta passou a ser opcional no frontend e backend.
- Removida também a exigência de agendamento ao movimentar uma carga para Programação.
- Calendário sem caixa interna envolvendo Agendamento/Carregamentos.
- Agendamento só aparece no dia quando há data de agendamento cadastrada.
- Sem agendamento no dia, Carregamentos ocupa toda a largura interna do bloco da data.
- Número do dia aumentado para melhorar a leitura.
- Nenhuma migration nova é necessária para estes ajustes.

## Validação

- `npm run build`: aprovado (TypeScript + Vite).
- ESLint dos arquivos alterados: aprovado, sem warnings.
- Sintaxe PHP: 121 arquivos verificados, sem erros.
