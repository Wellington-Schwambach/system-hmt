<?php

use App\Http\Controllers\Admin\SecurityController;
use App\Http\Controllers\Fleet\EmployeeController;
use App\Http\Controllers\Fleet\LocationController;
use App\Http\Controllers\Fleet\VehicleController;
use App\Http\Controllers\Operation\TravelController;
use App\Http\Controllers\Operation\FuelController;
use App\Http\Controllers\Operation\VehicleSetController;
use App\Http\Controllers\Operation\LogisticsController;
use App\Http\Controllers\Registration\ShipperController;
use App\Http\Controllers\Registration\CompanyProfileController;
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
            Route::post('/{shipper}/documents', [ShipperController::class, 'storeDocument']);
            Route::put('/{shipper}/documents/{document}', [ShipperController::class, 'updateDocument']);
            Route::delete('/{shipper}/documents/{document}', [ShipperController::class, 'destroyDocument']);
            Route::get('/{shipper}/documents/{document}/download', [ShipperController::class, 'downloadDocument']);
        });


    Route::prefix('company-profile')
        ->middleware('permission:registrations.company')
        ->group(function (): void {
            Route::get('/', [CompanyProfileController::class, 'show']);
            Route::put('/', [CompanyProfileController::class, 'save']);
            Route::post('/{companyProfile}/documents', [CompanyProfileController::class, 'storeDocument']);
            Route::put('/{companyProfile}/documents/{document}', [CompanyProfileController::class, 'updateDocument']);
            Route::delete('/{companyProfile}/documents/{document}', [CompanyProfileController::class, 'destroyDocument']);
            Route::get('/{companyProfile}/documents/{document}/download', [CompanyProfileController::class, 'downloadDocument']);
        });


    Route::prefix('vehicle-sets')
        ->middleware('permission:vehicle_sets')
        ->group(function (): void {
            Route::get('/options', [VehicleSetController::class, 'options']);
            Route::get('/', [VehicleSetController::class, 'index']);
            Route::post('/', [VehicleSetController::class, 'store']);
            Route::put('/{vehicleSet}/driver', [VehicleSetController::class, 'updateDriver']);
            Route::post('/{vehicleSet}/detach', [VehicleSetController::class, 'detach']);
        });

    Route::prefix('fuel')
        ->middleware('permission:fuel')
        ->group(function (): void {
            Route::get('/options', [FuelController::class, 'options']);
            Route::get('/', [FuelController::class, 'index']);
            Route::post('/import-legacy', [FuelController::class, 'importLegacy']);
            Route::post('/', [FuelController::class, 'store']);
            Route::put('/{fuelRecord}', [FuelController::class, 'update']);
            Route::patch('/{fuelRecord}/invoice', [FuelController::class, 'invoice']);
            Route::delete('/{fuelRecord}', [FuelController::class, 'destroy']);
        });

    Route::prefix('logistics')
        ->middleware('permission:logistics')
        ->group(function (): void {
            Route::get('/options', [LogisticsController::class, 'options']);
            Route::get('/calendar', [LogisticsController::class, 'calendar']);
            Route::get('/', [LogisticsController::class, 'index']);
            Route::post('/', [LogisticsController::class, 'store']);
            Route::put('/{logisticsLoad}', [LogisticsController::class, 'update']);
            Route::patch('/{logisticsLoad}/move', [LogisticsController::class, 'move']);
            Route::patch('/{logisticsLoad}/finish', [LogisticsController::class, 'finish']);
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

});
