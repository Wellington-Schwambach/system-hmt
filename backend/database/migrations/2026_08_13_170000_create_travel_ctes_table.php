<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('travel_ctes')) {
            Schema::create('travel_ctes', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('travel_id')->constrained('travels')->cascadeOnDelete();
                $table->string('cte_type', 30)->default('NORMAL');
                $table->string('cte_number', 30);
                $table->string('cte_series', 10)->default('1');
                $table->decimal('net_freight', 14, 2);
                $table->decimal('insurance_amount', 14, 2)->default(0);
                $table->decimal('toll_amount', 14, 2)->default(0);
                $table->decimal('icms_amount', 14, 2)->default(0);
                $table->decimal('bonus_amount', 14, 2)->default(0);
                $table->decimal('gross_freight', 14, 2);
                $table->timestamps();

                $table->unique(['cte_number', 'cte_series']);
                $table->index(['travel_id', 'cte_type']);
            });
        }

        if (! Schema::hasTable('travels')) {
            return;
        }

        DB::table('travels')
            ->orderBy('id')
            ->chunkById(250, function ($travels): void {
                foreach ($travels as $travel) {
                    $alreadyMigrated = DB::table('travel_ctes')
                        ->where('travel_id', $travel->id)
                        ->exists();

                    if ($alreadyMigrated) {
                        continue;
                    }

                    DB::table('travel_ctes')->insert([
                        'travel_id' => $travel->id,
                        'cte_type' => $travel->cte_type ?: 'NORMAL',
                        'cte_number' => $travel->cte_number,
                        'cte_series' => $travel->cte_series ?: '1',
                        'net_freight' => $travel->net_freight,
                        'insurance_amount' => $travel->insurance_amount ?? 0,
                        'toll_amount' => $travel->toll_amount ?? 0,
                        'icms_amount' => $travel->icms_amount ?? 0,
                        'bonus_amount' => $travel->bonus_amount ?? 0,
                        'gross_freight' => $travel->gross_freight,
                        'created_at' => $travel->created_at ?? now(),
                        'updated_at' => $travel->updated_at ?? now(),
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_ctes');
    }
};
