<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('shippers') && ! Schema::hasColumn('shippers', 'receipt_term_days')) {
            Schema::table('shippers', function (Blueprint $table): void {
                $table->unsignedSmallInteger('receipt_term_days')->nullable()->after('display_color');
            });
        }

        if (! Schema::hasTable('shipper_documents')) {
            Schema::create('shipper_documents', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('shipper_id')->constrained('shippers')->cascadeOnDelete();
                $table->string('name', 120);
                $table->string('original_name', 255);
                $table->string('path', 500);
                $table->string('mime_type', 120)->nullable();
                $table->unsignedBigInteger('size_bytes')->default(0);
                $table->unsignedSmallInteger('position')->default(0);
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->index(['shipper_id', 'position']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('shipper_documents');

        if (Schema::hasTable('shippers') && Schema::hasColumn('shippers', 'receipt_term_days')) {
            Schema::table('shippers', function (Blueprint $table): void {
                $table->dropColumn('receipt_term_days');
            });
        }
    }
};
