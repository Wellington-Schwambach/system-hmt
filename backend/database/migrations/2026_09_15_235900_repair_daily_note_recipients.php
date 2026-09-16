<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('daily_notes') || ! Schema::hasTable('daily_note_recipients')) {
            return;
        }

        $query = DB::table('daily_notes as note')
            ->leftJoin('daily_note_recipients as recipient', 'recipient.daily_note_id', '=', 'note.id')
            ->whereNull('recipient.id')
            ->select(['note.id', 'note.created_by']);

        if (Schema::hasColumn('daily_notes', 'deleted_at')) {
            $query->whereNull('note.deleted_at');
        }

        $now = now();

        foreach ($query->get() as $note) {
            if ($note->created_by === null) {
                continue;
            }

            DB::table('daily_note_recipients')->insertOrIgnore([
                'daily_note_id' => (int) $note->id,
                'user_id' => (int) $note->created_by,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // Correção de integridade de dados. Não removemos destinatários no rollback.
    }
};
