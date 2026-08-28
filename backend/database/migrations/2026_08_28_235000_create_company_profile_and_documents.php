<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('company_profiles')) {
            Schema::create('company_profiles', function (Blueprint $table): void {
                $table->id();
                $table->string('legal_name', 180);
                $table->string('trade_name', 180)->nullable();
                $table->string('cnpj', 18)->nullable()->unique();
                $table->string('state_registration', 40)->nullable();
                $table->string('municipal_registration', 40)->nullable();
                $table->string('rntrc', 40)->nullable();
                $table->date('opening_date')->nullable();
                $table->string('tax_regime', 80)->nullable();
                $table->string('email', 180)->nullable();
                $table->string('phone', 30)->nullable();
                $table->string('whatsapp', 30)->nullable();
                $table->string('website', 220)->nullable();
                $table->string('postal_code', 12)->nullable();
                $table->string('street', 180)->nullable();
                $table->string('number', 30)->nullable();
                $table->string('complement', 120)->nullable();
                $table->string('neighborhood', 120)->nullable();
                $table->string('city', 120)->nullable();
                $table->string('state', 2)->nullable();
                $table->string('responsible_name', 180)->nullable();
                $table->string('responsible_cpf', 14)->nullable();
                $table->string('responsible_phone', 30)->nullable();
                $table->string('responsible_email', 180)->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('company_documents')) {
            Schema::create('company_documents', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('company_profile_id')->constrained('company_profiles')->cascadeOnDelete();
                $table->string('name', 120);
                $table->string('original_name', 255);
                $table->string('path', 500);
                $table->string('mime_type', 120)->nullable();
                $table->unsignedBigInteger('size_bytes')->default(0);
                $table->unsignedInteger('position')->default(0);
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->index(['company_profile_id', 'position']);
            });
        }

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'menu_permissions')) {
            DB::table('users')->orderBy('id')->get(['id', 'role', 'menu_permissions'])->each(function ($user): void {
                $permissions = is_string($user->menu_permissions)
                    ? json_decode($user->menu_permissions, true)
                    : $user->menu_permissions;

                if (! is_array($permissions)) {
                    return;
                }

                $role = mb_strtolower(trim((string) $user->role));
                $shouldAdd = in_array($role, ['administrador', 'gestor', 'operador'], true)
                    || in_array('registrations.vehicles', $permissions, true)
                    || in_array('registrations.employees', $permissions, true)
                    || in_array('registrations.shippers', $permissions, true);

                if ($shouldAdd && ! in_array('registrations.company', $permissions, true)) {
                    $permissions[] = 'registrations.company';
                    DB::table('users')->where('id', $user->id)->update([
                        'menu_permissions' => json_encode(array_values(array_unique($permissions))),
                    ]);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'menu_permissions')) {
            DB::table('users')->orderBy('id')->get(['id', 'menu_permissions'])->each(function ($user): void {
                $permissions = is_string($user->menu_permissions)
                    ? json_decode($user->menu_permissions, true)
                    : $user->menu_permissions;

                if (! is_array($permissions)) {
                    return;
                }

                $permissions = array_values(array_filter(
                    $permissions,
                    fn ($permission): bool => $permission !== 'registrations.company'
                ));

                DB::table('users')->where('id', $user->id)->update([
                    'menu_permissions' => json_encode($permissions),
                ]);
            });
        }

        Schema::dropIfExists('company_documents');
        Schema::dropIfExists('company_profiles');
    }
};
