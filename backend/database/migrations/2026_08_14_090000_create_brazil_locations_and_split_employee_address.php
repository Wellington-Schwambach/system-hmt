<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brazil_states', function (Blueprint $table): void {
            $table->unsignedSmallInteger('id')->primary();
            $table->char('abbreviation', 2)->unique();
            $table->string('name', 100);
            $table->string('region', 30);
        });

        Schema::create('brazil_cities', function (Blueprint $table): void {
            $table->unsignedInteger('id')->primary();
            $table->unsignedSmallInteger('state_id');
            $table->string('name', 150);
            $table->foreign('state_id')->references('id')->on('brazil_states')->cascadeOnUpdate()->restrictOnDelete();
            $table->index(['state_id', 'name']);
        });

        $this->loadStates();
        $this->loadCities();

        Schema::table('employees', function (Blueprint $table): void {
            $table->string('address_street', 180)->nullable()->after('full_address');
            $table->string('address_number', 30)->nullable()->after('address_street');
            $table->string('address_neighborhood', 100)->nullable()->after('address_number');
            $table->unsignedSmallInteger('state_id')->nullable()->after('address_neighborhood');
            $table->unsignedInteger('city_id')->nullable()->after('state_id');
            $table->foreign('state_id')->references('id')->on('brazil_states')->nullOnDelete();
            $table->foreign('city_id')->references('id')->on('brazil_cities')->nullOnDelete();
            $table->index(['state_id', 'city_id']);
        });

        DB::table('employees')
            ->whereNotNull('full_address')
            ->where('full_address', '<>', '')
            ->whereNull('address_street')
            ->update(['address_street' => DB::raw('full_address')]);
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->dropForeign(['city_id']);
            $table->dropForeign(['state_id']);
            $table->dropIndex(['state_id', 'city_id']);
            $table->dropColumn([
                'address_street',
                'address_number',
                'address_neighborhood',
                'state_id',
                'city_id',
            ]);
        });

        Schema::dropIfExists('brazil_cities');
        Schema::dropIfExists('brazil_states');
    }

    private function loadStates(): void
    {
        $rows = $this->readCsv(database_path('data/brazil_states.csv'));
        $states = array_map(static fn (array $row): array => [
            'id' => (int) $row['codigo_uf'],
            'abbreviation' => $row['uf'],
            'name' => $row['nome'],
            'region' => $row['regiao'],
        ], $rows);

        DB::table('brazil_states')->insert($states);
    }

    private function loadCities(): void
    {
        $rows = $this->readCsv(database_path('data/brazil_cities.csv'));
        $cities = array_map(static fn (array $row): array => [
            'id' => (int) $row['codigo_ibge'],
            'state_id' => (int) $row['codigo_uf'],
            'name' => $row['nome'],
        ], $rows);

        foreach (array_chunk($cities, 500) as $chunk) {
            DB::table('brazil_cities')->insert($chunk);
        }
    }

    /** @return array<int, array<string, string>> */
    private function readCsv(string $path): array
    {
        $handle = fopen($path, 'rb');

        if ($handle === false) {
            throw new \RuntimeException("Não foi possível abrir o arquivo de localidades: {$path}");
        }

        $headers = fgetcsv($handle);
        if ($headers === false) {
            fclose($handle);
            throw new \RuntimeException("O arquivo de localidades está vazio: {$path}");
        }

        $headers = array_map(static fn (string $header): string => ltrim($header, "\xEF\xBB\xBF"), $headers);
        $rows = [];

        while (($values = fgetcsv($handle)) !== false) {
            if (count($values) !== count($headers)) {
                continue;
            }

            $rows[] = array_combine($headers, $values);
        }

        fclose($handle);

        return $rows;
    }
};
