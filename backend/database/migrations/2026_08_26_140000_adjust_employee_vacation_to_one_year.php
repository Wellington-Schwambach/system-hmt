<?php

use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->recalculate(12);
    }

    public function down(): void
    {
        $this->recalculate(22);
    }

    private function recalculate(int $months): void
    {
        if (! Schema::hasTable('employees') || ! Schema::hasColumn('employees', 'vacation_date')) {
            return;
        }

        DB::table('employees')
            ->whereNotNull('admission_date')
            ->orderBy('id')
            ->get(['id', 'admission_date'])
            ->each(function ($employee) use ($months): void {
                $date = CarbonImmutable::parse((string) $employee->admission_date)
                    ->addMonthsNoOverflow($months)
                    ->toDateString();

                DB::table('employees')->where('id', $employee->id)->update([
                    'vacation_date' => $date,
                ]);
            });
    }
};
