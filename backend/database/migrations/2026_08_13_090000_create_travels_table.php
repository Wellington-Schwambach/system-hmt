<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travels', function (Blueprint $table): void {
            $table->id();
            $table->string('cte_type', 30)->default('NORMAL');
            $table->date('travel_date');
            $table->date('receipt_date')->nullable();
            $table->string('origin', 150);
            $table->string('destination', 150);
            $table->string('cte_number', 30);
            $table->string('cte_series', 10)->default('1');
            $table->string('shipper', 50);
            $table->string('operation_type', 20)->default('FLEET');

            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->string('plate_snapshot', 10);

            $table->foreignId('driver_one_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('driver_one_name', 150)->nullable();
            $table->foreignId('driver_two_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('driver_two_name', 150)->nullable();

            $table->string('third_party_name', 150)->nullable();
            $table->string('third_party_plate', 10)->nullable();
            $table->decimal('third_party_payout_amount', 14, 2)->default(0);

            $table->foreignId('detached_trailer_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->string('detached_trailer_plate_snapshot', 10)->nullable();

            $table->decimal('net_freight', 14, 2);
            $table->decimal('insurance_amount', 14, 2)->default(0);
            $table->decimal('toll_amount', 14, 2)->default(0);
            $table->decimal('icms_amount', 14, 2)->default(0);
            $table->decimal('bonus_amount', 14, 2)->default(0);
            $table->decimal('gross_freight', 14, 2);

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['cte_number', 'cte_series']);
            $table->index(['travel_date', 'shipper']);
            $table->index('plate_snapshot');
            $table->index('receipt_date');
            $table->index('driver_one_id');
            $table->index('driver_two_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travels');
    }
};
