# Ajustes de Dashboard e Cargas - 18/09/2026

## Dashboard
- Notas/alertas concluídos deixam de aparecer no card Notas do dia.
- Notas concluídas também deixam de contar/sinalizar o calendário do Dashboard.

## Calendário de cargas
- Ao entrar em uma data com agendamentos de coleta, o sistema exibe um aviso com a quantidade de cargas e os embarcadores envolvidos.
- Observação da origem foi movida para o bloco de Carregamento no cadastro.
- Observação do destino foi movida para o bloco de Baixa / Entrega no cadastro.
- Duplicação usa uma rota própria e copia todos os dados operacionais da carga, inclusive agendamentos de coleta e baixa. Identificador interno, conclusão e históricos não são copiados.
- A tela do dia ganhou as abas Cargas e Histórico.
- Histórico consolida a auditoria das cargas exibidas naquele dia, mostrando carga, alteração, usuário e data/hora.

## Validação
- npm run lint: OK
- npm run build (TypeScript + Vite): OK
- 139 arquivos PHP validados com php -l: OK
