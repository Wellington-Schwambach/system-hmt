-- Reparo de integridade das Notas do Dia.
-- Use somente se NÃO executar as migrations do Laravel.
-- Notas antigas sem nenhum destinatário passam a ser visíveis ao usuário que as criou.

INSERT INTO daily_note_recipients (daily_note_id, user_id, created_at, updated_at)
SELECT note.id, note.created_by, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM daily_notes AS note
WHERE note.deleted_at IS NULL
  AND note.created_by IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM daily_note_recipients AS recipient
      WHERE recipient.daily_note_id = note.id
  )
ON CONFLICT (daily_note_id, user_id) DO NOTHING;
