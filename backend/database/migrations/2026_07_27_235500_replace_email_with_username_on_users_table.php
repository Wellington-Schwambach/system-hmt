<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'username')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->string('username', 100)->nullable();
            });
        }

        $usedUsernames = [];

        DB::table('users')
            ->select(['id', 'username', ...(Schema::hasColumn('users', 'email') ? ['email'] : [])])
            ->orderBy('id')
            ->get()
            ->each(function (object $user) use (&$usedUsernames): void {
                $currentUsername = trim((string) ($user->username ?? ''));
                $email = trim((string) ($user->email ?? ''));

                $source = $currentUsername !== ''
                    ? $currentUsername
                    : Str::before($email, '@');

                $base = Str::lower(Str::ascii($source));
                $base = (string) preg_replace('/[^a-z0-9._-]+/', '', $base);
                $base = trim($base, '._-');
                $base = $base !== '' ? Str::limit($base, 90, '') : 'usuario'.$user->id;

                $username = $base;
                $suffix = 2;

                while (isset($usedUsernames[Str::lower($username)])) {
                    $username = Str::limit($base, 90, '').'_'.$suffix;
                    $suffix++;
                }

                $usedUsernames[Str::lower($username)] = true;

                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['username' => $username]);
            });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN username SET NOT NULL');
            DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique ON users (LOWER(username))');
        } else {
            Schema::table('users', function (Blueprint $table): void {
                $table->unique('username', 'users_username_unique');
            });
        }

        if (Schema::hasColumn('users', 'email')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->dropUnique(['email']);
                $table->dropColumn('email');
            });
        }

        if (Schema::hasColumn('users', 'email_verified_at')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->dropColumn('email_verified_at');
            });
        }

        Schema::dropIfExists('password_reset_tokens');
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS users_username_lower_unique');
        } else {
            Schema::table('users', function (Blueprint $table): void {
                $table->dropUnique('users_username_unique');
            });
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->string('email')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
        });

        DB::table('users')->orderBy('id')->get(['id', 'username'])->each(
            static function (object $user): void {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['email' => $user->username.'@local.invalid']);
            }
        );

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('username');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table): void {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }
};
