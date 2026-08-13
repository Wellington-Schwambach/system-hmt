<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shippers', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 100);
            $table->string('normalized_name', 100)->unique();
            $table->string('status', 20)->default('ACTIVE');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'name']);
        });

        Schema::table('travels', function (Blueprint $table): void {
            $table->foreignId('shipper_id')
                ->nullable()
                ->after('shipper')
                ->constrained('shippers')
                ->nullOnDelete();
        });

        $defaults = ['BRF', 'Aurora', 'Milia', 'GEO', 'Itracon'];
        $existing = DB::table('travels')
            ->whereNotNull('shipper')
            ->where('shipper', '<>', '')
            ->distinct()
            ->pluck('shipper')
            ->all();

        foreach (array_values(array_unique([...$defaults, ...$existing])) as $name) {
            $cleanName = preg_replace('/\s+/', ' ', trim((string) $name));
            if ($cleanName === '') {
                continue;
            }

            $normalized = function_exists('mb_strtoupper') ? mb_strtoupper($cleanName, 'UTF-8') : strtoupper($cleanName);

            DB::table('shippers')->updateOrInsert(
                ['normalized_name' => $normalized],
                [
                    'name' => $cleanName,
                    'status' => 'ACTIVE',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $shippers = DB::table('shippers')->get(['id', 'normalized_name']);
        foreach ($shippers as $shipper) {
            DB::table('travels')
                ->whereRaw('UPPER(TRIM(shipper)) = ?', [$shipper->normalized_name])
                ->update(['shipper_id' => $shipper->id]);
        }
    }

    public function down(): void
    {
        Schema::table('travels', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('shipper_id');
        });

        Schema::dropIfExists('shippers');
    }
};
