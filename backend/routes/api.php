<?php

use App\Http\Controllers\Admin\SecurityController;
use App\Http\Controllers\Fleet\EmployeeController;
use App\Http\Controllers\Fleet\LocationController;
use App\Http\Controllers\Fleet\VehicleController;
use App\Http\Controllers\Operation\TravelController;
use App\Http\Controllers\Registration\ShipperController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'access.schedule', 'session.expiration'])->group(function (): void {
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Usuário autenticado, autorizado e dentro do horário permitido.',
        ]);
    })->middleware('permission:dashboard');

    Route::prefix('admin/security')
        ->middleware('admin')
        ->group(function (): void {
            Route::get('/overview', [SecurityController::class, 'overview']);
            Route::post('/users', [SecurityController::class, 'store']);
            Route::put('/users/{user}', [SecurityController::class, 'update']);
            Route::put('/users/{user}/access-schedule', [SecurityController::class, 'updateSchedule']);
            Route::post('/blocks/unblock', [SecurityController::class, 'unblock']);
        });

    Route::prefix('vehicles')
        ->middleware('permission:registrations.vehicles')
        ->group(function (): void {
            Route::get('/', [VehicleController::class, 'index']);
            Route::post('/', [VehicleController::class, 'store']);
            Route::post('/{vehicle}', [VehicleController::class, 'update']);
            Route::delete('/{vehicle}', [VehicleController::class, 'destroy']);
            Route::get('/{vehicle}/crlv', [VehicleController::class, 'downloadCrlv'])
                ->name('vehicles.crlv.download');
        });


    Route::prefix('locations')
        ->middleware('permission:registrations.employees')
        ->group(function (): void {
            Route::get('/states', [LocationController::class, 'states']);
            Route::get('/states/{state}/cities', [LocationController::class, 'cities']);
        });

    Route::prefix('employees')
        ->middleware('permission:registrations.employees')
        ->group(function (): void {
            Route::get('/', [EmployeeController::class, 'index']);
            Route::post('/', [EmployeeController::class, 'store']);
            Route::post('/{employee}', [EmployeeController::class, 'update']);
            Route::delete('/{employee}', [EmployeeController::class, 'destroy']);
            Route::get('/{employee}/documents/{documentType}', [EmployeeController::class, 'downloadDocument'])
                ->whereIn('documentType', ['cnh', 'aso', 'toxicological', 'registration-form'])
                ->name('employees.documents.download');
        });


    Route::prefix('shippers')
        ->middleware('permission:registrations.shippers')
        ->group(function (): void {
            Route::get('/', [ShipperController::class, 'index']);
            Route::post('/', [ShipperController::class, 'store']);
            Route::put('/{shipper}', [ShipperController::class, 'update']);
            Route::delete('/{shipper}', [ShipperController::class, 'destroy']);
        });

    Route::prefix('travels')
        ->middleware('permission:travel')
        ->group(function (): void {
            Route::get('/options', [TravelController::class, 'options']);
            Route::get('/cities', [TravelController::class, 'cities']);
            Route::post('/shippers', [TravelController::class, 'storeShipper']);
            Route::get('/', [TravelController::class, 'index']);
            Route::post('/', [TravelController::class, 'store']);
            Route::put('/{travel}', [TravelController::class, 'update']);
            Route::delete('/{travel}', [TravelController::class, 'destroy']);
        });

    // Ao criar APIs dos demais módulos, aplique a permissão correspondente:
    // Route::apiResource('fuel', FuelController::class)->middleware('permission:fuel');
});
