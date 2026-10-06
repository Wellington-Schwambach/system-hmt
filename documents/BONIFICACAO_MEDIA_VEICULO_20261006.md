# Bonificação por média do veículo

Implementação inicial para apresentação e validação da regra operacional.

## Tabelas cadastradas

| Tabela | Faixas de média → percentual |
|---|---|
| QIT / QIV | 2,65 → 6,5%; 2,70 → 7%; 2,75 → 7,5%; 2,80 → 8%; 2,85 → 8,5% |
| QJF / EIB | 2,80 → 6,5%; 2,85 → 7%; 2,90 → 7,5%; 2,95 → 8%; 3,00 → 8,5% |
| DCU / GIU / RXT / RXQ / GES | 2,85 → 6,5%; 2,90 → 7%; 2,95 → 7,5%; 3,00 → 8%; 3,05 → 8,5% |
| RYU / SXS / SXF / SXT / SXX / TPO / TPL | 3,05 → 6,5%; 3,10 → 7%; 3,15 → 7,5%; 3,20 → 8%; 3,25 → 8,5%; 3,30 → 9% |
| RYZ / RYS / TPT0G19 PLUS | 2,95 → 6,5%; 3,00 → 7%; 3,05 → 7,5%; 3,10 → 8%; 3,15 → 8,5% |

## Regras aplicadas

- A configuração é vinculada ao cadastro da placa.
- Fora de desengate, havendo média válida, o percentual começa em 7% e sobe conforme a faixa atingida na tabela escolhida.
- Desengate usa 6,5% fixo e não sobe conforme a média.
- Veículos marcados com acréscimo especial recebem +0,5 ponto percentual no percentual final.
- A bonificação é calculada sobre o frete efetivamente considerado para o motorista no Acerto, preservando o rateio de dupla já aplicado às viagens.
- O Acerto grava a tabela, percentual-base, acréscimo e percentual final no snapshot para que um fechamento antigo não mude quando a configuração atual do veículo for alterada.
- Veículos existentes continuam com a bonificação desativada até serem configurados.

A estrutura das tabelas foi separada do veículo para permitir futura tela administrativa de manutenção das faixas sem duplicar a mesma regra em várias placas.
