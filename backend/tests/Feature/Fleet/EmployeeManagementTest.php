<?php

namespace Tests\Feature\Fleet;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EmployeeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_update_download_and_delete_employee(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create([
            'role' => 'Administrador',
            'menu_permissions' => ['registrations.employees'],
        ]);

        $createResponse = $this->actingAs($admin)->post('/api/employees', [
            ...$this->validPayload(),
            'cnh_file' => UploadedFile::fake()->create('cnh.pdf', 120, 'application/pdf'),
            'aso_file' => UploadedFile::fake()->image('aso.jpg'),
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('employee.employee_code', 'MOT-001')
            ->assertJsonPath('employee.state.abbreviation', 'SC')
            ->assertJsonPath('employee.city.name', 'Itajaí')
            ->assertJsonPath('employee.probation_end_date', '2024-02-24')
            ->assertJsonPath('employee.probation_extension_end_date', '2024-04-09')
            ->assertJsonPath('employee.vacation_date', '2025-01-10');
        $employee = Employee::query()->firstOrFail();
        $this->assertDatabaseCount('employee_documents', 2);

        $this->actingAs($admin)
            ->get("/api/employees/{$employee->id}/documents/cnh")
            ->assertOk();

        $this->actingAs($admin)
            ->post("/api/employees/{$employee->id}", [
                ...$this->validPayload(),
                'full_name' => 'Motorista Atualizado',
                'remove_aso_file' => '1',
            ])
            ->assertOk()
            ->assertJsonPath('employee.full_name', 'Motorista Atualizado');

        $this->assertDatabaseMissing('employee_documents', [
            'employee_id' => $employee->id,
            'type' => EmployeeDocument::TYPE_ASO,
        ]);

        $this->actingAs($admin)
            ->delete("/api/employees/{$employee->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
        $this->assertDatabaseCount('employee_documents', 0);
    }

    /** @return array<string, string> */
    private function validPayload(): array
    {
        return [
            'employee_code' => 'MOT-001',
            'full_name' => 'Motorista Teste',
            'cpf' => '12345678901',
            'rg' => '1234567',
            'birth_date' => '1990-01-10',
            'phone' => '47999999999',
            'email' => 'motorista@example.com',
            'full_address' => 'Rua Teste, 100 - Centro - Itajaí - SC',
            'address_street' => 'Rua Teste',
            'address_number' => '100',
            'address_neighborhood' => 'Centro',
            'state_id' => '42',
            'city_id' => '4208203',
            'job_title' => 'Motorista',
            'admission_date' => '2024-01-10',
            'termination_date' => '',
            'family_contact' => 'Maria - esposa - 47988888888',
            'status' => 'ACTIVE',
            'cnh_number' => '01234567890',
            'cnh_category' => 'E',
            'cnh_issued_at' => '2025-01-10',
            'cnh_first_license_date' => '2008-05-20',
            'cnh_expiry_date' => '2030-01-10',
            'cnh_state' => 'SC',
            'cnh_security_code' => 'ABC123',
            'aso_expiry_date' => '2027-01-10',
            'opentech_expiry_date' => '2027-02-10',
            'angellira_expiry_date' => '2027-03-10',
            'toxicological_expiry_date' => '2027-04-10',
            'trainings' => 'MOPP e direção defensiva',
            'notes' => 'Sem observações',
        ];
    }
}
