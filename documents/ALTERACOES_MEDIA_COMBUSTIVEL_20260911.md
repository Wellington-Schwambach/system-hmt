# Ajuste da média de combustível - 11/09/2026

- Média passa a usar o último KM válido do abastecimento anterior em ordem cronológica.
- Inclusão retroativa recalcula automaticamente o próprio registro e os posteriores.
- Edição, inativação e reativação também recalculam a sequência afetada.
- `vehicles.current_km` continua monotônico: nunca é reduzido por lançamento retroativo.
- A prévia do formulário usa a referência cronológica quando ela já pode ser determinada pelos registros carregados.
- Após salvar ou excluir, a tela recarrega os abastecimentos para refletir médias recalculadas em outros registros.
- Migration corretiva incluída para recalcular dados existentes.
- SQL manual equivalente incluído para ambientes que não aplicam migrations.
