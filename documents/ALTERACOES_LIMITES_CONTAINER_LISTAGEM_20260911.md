# Ajustes de logística - 11/09/2026

- Listagem diária ordenada alfabeticamente por embarcador; dentro do mesmo embarcador, mantém a ordem pela hora operacional.
- Número do container limitado a 11 caracteres no padrão `AAAA9999999` (4 letras + 7 números).
- Tara limitada a 4 dígitos numéricos (0 a 9999 kg).
- Payload limitado a 5 dígitos numéricos (0 a 99999 kg).
- As mesmas regras foram adicionadas no backend Laravel para impedir gravações fora do padrão pela API.
