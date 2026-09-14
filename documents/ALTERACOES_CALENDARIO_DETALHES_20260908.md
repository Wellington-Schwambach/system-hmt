# Ajustes Logística - Calendário e painel lateral - 08/09/2026

## Painel lateral de detalhes
- Removidos Grade e Data/Hora da Grade da seção Identificação e planejamento.
- Adicionados Local de carregamento e Data de carregamento nessa seção.
- Datas operacionais reorganizadas:
  - Agendamento da coleta em linha inteira;
  - Local coleta + Data/Hora coleta;
  - Local da baixa + Data da baixa.
- Painel lateral mantido somente para consulta: removidos Editar e Duplicar dentro do painel.
- Código automático de referência (ex.: LOG-2026...) não é mais exibido no painel ou nas mensagens da Logística.

## Listagem do dia
- Coluna Grade agora mostra a data de carregamento.
- Coluna Hora da Grade agora mostra a hora de carregamento.
- Botões Editar e Duplicar continuam disponíveis somente na listagem, conforme solicitado anteriormente.
- ESC retorna da listagem para o calendário. Se um painel/modal estiver aberto, ESC fecha primeiro a camada aberta.

## Calendário principal
- Alterado de visualização semanal para o mês completo.
- Todos os dias do mês ficam disponíveis na mesma tela.
- Agendamento e Carregamentos continuam separados em cada dia.
- Número da semana mantido em cada linha do calendário.
- Setas passam a navegar por mês.
- Botão de semana atual retorna ao mês atual.

## Limpeza adicional
- Removida exibição do código interno automático também nos cards/painel do quadro de logística.
- Serviço de calendário renomeado internamente de calendarWeek para calendarRange, pois agora consulta o mês inteiro.

## Validações executadas
- `npm run build`: OK (TypeScript + Vite).
- ESLint nos 4 arquivos alterados: OK, zero warnings.
- Sintaxe PHP em 123 arquivos de backend/routes/database: OK.
- Teste da composição mensal para setembro/2026: 30 dias únicos, semanas 36 a 40.
- Asserções estáticas das regras solicitadas: OK.
