# Ajuste do Acerto - campos opcionais do snapshot

A validação do backend foi ajustada para permitir salvar Acertos sem viagens, sem vales/descontos, sem médias e sem abastecimentos selecionados.

Os campos internos abaixo não são mais obrigatórios e podem ser arrays vazios ou estar ausentes em snapshots antigos:

- `snapshot.travels`
- `snapshot.vehicleSummaries`
- `snapshot.entries`
- `snapshot.totals`
- `snapshot.selectedFuelRecordIds`

O backend já normaliza esses campos para estruturas válidas antes de gravar o Acerto.

Não há migration de banco nesta alteração.
