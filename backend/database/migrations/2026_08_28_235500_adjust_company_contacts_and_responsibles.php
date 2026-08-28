<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('company_profiles')) {
            return;
        }

        Schema::table('company_profiles', function (Blueprint $table): void {
            if (! Schema::hasColumn('company_profiles', 'email_secondary')) {
                $table->string('email_secondary', 180)->nullable()->after('email');
            }
            if (! Schema::hasColumn('company_profiles', 'responsible_two_name')) {
                $table->string('responsible_two_name', 180)->nullable()->after('responsible_email');
            }
            if (! Schema::hasColumn('company_profiles', 'responsible_two_cpf')) {
                $table->string('responsible_two_cpf', 14)->nullable()->after('responsible_two_name');
            }
            if (! Schema::hasColumn('company_profiles', 'responsible_two_phone')) {
                $table->string('responsible_two_phone', 30)->nullable()->after('responsible_two_cpf');
            }
            if (! Schema::hasColumn('company_profiles', 'responsible_two_email')) {
                $table->string('responsible_two_email', 180)->nullable()->after('responsible_two_phone');
            }
        });

        if (Schema::hasColumn('company_profiles', 'website')) {
            Schema::table('company_profiles', function (Blueprint $table): void {
                $table->dropColumn('website');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('company_profiles')) {
            return;
        }

        Schema::table('company_profiles', function (Blueprint $table): void {
            foreach (['email_secondary', 'responsible_two_name', 'responsible_two_cpf', 'responsible_two_phone', 'responsible_two_email'] as $column) {
                if (Schema::hasColumn('company_profiles', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        if (! Schema::hasColumn('company_profiles', 'website')) {
            Schema::table('company_profiles', function (Blueprint $table): void {
                $table->string('website', 220)->nullable();
            });
        }
    }
};
