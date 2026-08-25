<?php

use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $hasProbationExtension = Schema::hasColumn('employees', 'probation_extension_end_date');
        $hasVacationDate = Schema::hasColumn('employees', 'vacation_date');

        Schema::table('employees', function (Blueprint $table) use (
            $hasProbationExtension,
            $hasVacationDate
        ): void {
            if (! $hasProbationExtension) {
                $table->date('probation_extension_end_date')->nullable();
            }

            if (! $hasVacationDate) {
                $table->date('vacation_date')->nullable();
            }
        });

        DB::table('employees')
            ->select(['id', 'admission_date'])
            ->orderBy('id')
            ->get()
            ->each(function (object $employee): void {
                if ($employee->admission_date === null) {
                    return;
                }

                $admissionDate = CarbonImmutable::parse((string) $employee->admission_date)->startOfDay();

                DB::table('employees')
                    ->where('id', $employee->id)
                    ->update([
                        'probation_end_date' => $admissionDate->addDays(45)->toDateString(),
                        'probation_extension_end_date' => $admissionDate->addDays(90)->toDateString(),
                        'vacation_date' => $admissionDate->addMonthsNoOverflow(22)->toDateString(),
                    ]);
            });
    }

    public function down(): void
    {
        $hasProbationExtension = Schema::hasColumn('employees', 'probation_extension_end_date');
        $hasVacationDate = Schema::hasColumn('employees', 'vacation_date');

        Schema::table('employees', function (Blueprint $table) use (
            $hasProbationExtension,
            $hasVacationDate
        ): void {
            if ($hasVacationDate) {
                $table->dropColumn('vacation_date');
            }

            if ($hasProbationExtension) {
                $table->dropColumn('probation_extension_end_date');
            }
        });
    }
};
