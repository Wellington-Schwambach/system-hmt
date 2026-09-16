# Ajustes de Veículos, Colaboradores e Viagens — 15/09/2026

## Veículos
- Listagem ordenada por tipo: Cavalos, Carretas e depois Outros.
- Dentro de cada tipo, ordenação por número de frota e placa.
- KM atual exibido considera o maior KM ativo já lançado em abastecimentos.
- Edição manual do veículo não pode reduzir o KM abaixo do odômetro atual nem do maior KM histórico de abastecimento.
- Migration/SQL de sincronização incluídos para corrigir cadastros antigos.
- Vencimentos: verde acima de 30 dias, amarelo entre 8 e 30 dias, vermelho com 7 dias ou menos (incluindo vencidos).

## Colaboradores
- Vencimentos da listagem ganham alerta amarelo entre 8 e 30 dias e vermelho com 7 dias ou menos (incluindo vencidos).
- Datas com mais de 30 dias permanecem com apresentação neutra.

## Viagens
- Data de recebimento continua sendo preenchida automaticamente a partir do prazo do embarcador, mas agora pode ser alterada manualmente.
- O backend respeita a data manual informada; só calcula automaticamente quando a data de recebimento não foi enviada.
- A listagem passa a usar o nome atual do embarcador vinculado, em vez do texto antigo salvo como snapshot na viagem.
- Exemplo: se `shippers.name` for `AURORA`, viagens antigas deixam de exibir `Aurora` e passam a exibir `AURORA` sem precisar alterar cada viagem.
