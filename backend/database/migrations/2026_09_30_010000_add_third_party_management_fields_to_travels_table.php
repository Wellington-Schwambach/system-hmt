<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('travels', function (Blueprint $table): void {
            if (! Schema::hasColumn('travels', 'third_party_payment_type')) {
                $table->string('third_party_payment_type', 20)
                    ->nullable()
                    ->after('third_party_payout_date');
            }

            if (! Schema::hasColumn('travels', 'third_party_counter_freight_number')) {
                $table->string('third_party_counter_freight_number', 60)
                    ->nullable()
                    ->after('third_party_payment_type');
            }

            if (! Schema::hasColumn('travels', 'third_party_paid_at')) {
                $table->timestamp('third_party_paid_at')
                    ->nullable()
                    ->after('third_party_counter_freight_number');
            }

            if (! Schema::hasColumn('travels', 'third_party_paid_by')) {
                $table->foreignId('third_party_paid_by')
                    ->nullable()
                    ->after('third_party_paid_at')
                    ->constrained('users')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('travels', function (Blueprint $table): void {
            if (Schema::hasColumn('travels', 'third_party_paid_by')) {
                $table->dropConstrainedForeignId('third_party_paid_by');
            }

            $columns = collect([
                'third_party_paid_at',
                'third_party_counter_freight_number',
                'third_party_payment_type',
            ])->filter(fn (string $column): bool => Schema::hasColumn('travels', $column))->all();

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
