<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_average_bonus_profiles', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 60)->unique();
            $table->string('name', 160);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('vehicle_average_bonus_profile_rules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('profile_id')
                ->constrained('vehicle_average_bonus_profiles')
                ->cascadeOnDelete();
            $table->decimal('minimum_average', 6, 3);
            $table->decimal('percent', 5, 2);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['profile_id', 'minimum_average']);
        });

        Schema::table('vehicles', function (Blueprint $table): void {
            $table->foreignId('average_bonus_profile_id')
                ->nullable()
                ->after('average_bonus_valid_from')
                ->constrained('vehicle_average_bonus_profiles')
                ->nullOnDelete();
            $table->boolean('average_bonus_disengagement')
                ->default(false)
                ->after('average_bonus_profile_id');
            $table->decimal('average_bonus_extra_percent', 4, 2)
                ->default(0)
                ->after('average_bonus_disengagement');
        });

        $profiles = [
            [
                'code' => 'QIT_QIV',
                'name' => 'QIT / QIV',
                'rules' => [[2.65, 6.5], [2.70, 7.0], [2.75, 7.5], [2.80, 8.0], [2.85, 8.5]],
            ],
            [
                'code' => 'QJF_EIB',
                'name' => 'QJF / EIB',
                'rules' => [[2.80, 6.5], [2.85, 7.0], [2.90, 7.5], [2.95, 8.0], [3.00, 8.5]],
            ],
            [
                'code' => 'DCU_GIU_RXT_RXQ_GES',
                'name' => 'DCU / GIU / RXT / RXQ / GES',
                'rules' => [[2.85, 6.5], [2.90, 7.0], [2.95, 7.5], [3.00, 8.0], [3.05, 8.5]],
            ],
            [
                'code' => 'RYU_SXS_SXF_SXT_SXX_TPO_TPL',
                'name' => 'RYU / SXS / SXF / SXT / SXX / TPO / TPL',
                'rules' => [[3.05, 6.5], [3.10, 7.0], [3.15, 7.5], [3.20, 8.0], [3.25, 8.5], [3.30, 9.0]],
            ],
            [
                'code' => 'RYZ_RYS_TPT0G19_PLUS',
                'name' => 'RYZ / RYS / TPT0G19 PLUS',
                'rules' => [[2.95, 6.5], [3.00, 7.0], [3.05, 7.5], [3.10, 8.0], [3.15, 8.5]],
            ],
        ];

        $now = now();
        foreach ($profiles as $profile) {
            $profileId = DB::table('vehicle_average_bonus_profiles')->insertGetId([
                'code' => $profile['code'],
                'name' => $profile['name'],
                'active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            foreach ($profile['rules'] as $position => [$minimumAverage, $percent]) {
                DB::table('vehicle_average_bonus_profile_rules')->insert([
                    'profile_id' => $profileId,
                    'minimum_average' => $minimumAverage,
                    'percent' => $percent,
                    'position' => $position + 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('average_bonus_profile_id');
            $table->dropColumn([
                'average_bonus_disengagement',
                'average_bonus_extra_percent',
            ]);
        });

        Schema::dropIfExists('vehicle_average_bonus_profile_rules');
        Schema::dropIfExists('vehicle_average_bonus_profiles');
    }
};
