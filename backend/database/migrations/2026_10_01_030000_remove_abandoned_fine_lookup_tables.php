<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Remove tabelas criadas pelas tentativas anteriores de consulta automática.
        // Os campos manuais da multa em driver_deductions são preservados.
        Schema::dropIfExists('traffic_fine_auto_catalog');
        Schema::dropIfExists('traffic_infraction_catalog');
        Schema::dropIfExists('fine_description_catalog');
    }

    public function down(): void
    {
        // Intencionalmente vazio: a consulta automática foi removida do sistema.
    }
};
