# Multas - cadastro manual

A consulta automática por Nº do Auto foi removida do projeto.

No cadastro e na edição de multas:

- Nº Auto / Nº Multa é digitado manualmente e aceita identificadores alfanuméricos, sem pontos, espaços ou traços, com até 100 caracteres.
- Código da infração é digitado manualmente e, quando informado, deve conter 5 dígitos.
- Descrição da multa é preenchida manualmente.
- Não existe consulta automática ao sair do campo e não há integração com WSDenatran/RENAINF/SERPRO.
- A migration `2026_10_01_030000_remove_abandoned_fine_lookup_tables.php` remove tabelas residuais das tentativas anteriores sem apagar os dados de multas já cadastradas.
