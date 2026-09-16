# Correção Dashboard / Notas do Dia - 15/09/2026

- O Dashboard não falha mais inteiro quando migrations de Notas do Dia ainda estão pendentes.
- Preferências usam os valores padrão quando `daily_note_preferences` ainda não existe.
- Notas manuais são ignoradas com segurança enquanto as tabelas correspondentes não existirem.
- Conclusões são tratadas como pendentes e o check fica indisponível se `daily_note_completions` ainda não existir.
- A rota de conclusão retorna HTTP 503 com orientação para executar `php artisan migrate`, em vez de provocar erro SQL/500.
- O Dashboard possui fallback protegido para o módulo de notas, preservando métricas e demais widgets caso ocorra uma falha isolada nas notas.
- Exclusão/edição de notas não tenta remover conclusões se a tabela ainda não existir.

Após publicar esta versão, execute `php artisan migrate` no backend para habilitar completamente o check de conclusão.
