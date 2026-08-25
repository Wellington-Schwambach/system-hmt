# Período mensal padrão na tela de Viagens

A tela de Viagens foi ajustada para exibir as datas no formato completo `dd/mm/aaaa`.

Ao abrir a tela, o filtro de período já é preenchido automaticamente com o primeiro e o último dia do mês atual.

Exemplo para agosto de 2026:

- Data inicial: `01/08/2026`
- Data final: `31/08/2026`

Internamente o filtro continua utilizando `yyyy-mm-dd`, preservando as comparações e cálculos existentes.

Não há migration ou alteração no banco de dados.
