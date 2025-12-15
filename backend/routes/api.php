<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Rutas públicas
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Perfil de usuario
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Gestión de usuarios (solo admin)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/users', UserController::class);
    });
    
    // Gestión de vehículos
    Route::apiResource('/vehicles', VehicleController::class);
    Route::get('/vehicles/available', [VehicleController::class, 'available']);
    Route::put('/vehicles/{vehicle}/status', [VehicleController::class, 'updateStatus']);
    
    // Gestión de mantenimientos
    Route::apiResource('/maintenances', MaintenanceController::class);
    Route::get('/vehicles/{vehicle}/maintenances', [MaintenanceController::class, 'byVehicle']);
    Route::get('/maintenances/scheduled', [MaintenanceController::class, 'scheduled']);
    
    // Gestión de alquileres
    Route::apiResource('/rentals', RentalController::class);
    Route::get('/rentals/customer/{customer}', [RentalController::class, 'byCustomer']);
    Route::get('/rentals/vehicle/{vehicle}', [RentalController::class, 'byVehicle']);
    Route::post('/rentals/{rental}/confirm', [RentalController::class, 'confirm']);
    Route::post('/rentals/{rental}/complete', [RentalController::class, 'complete']);
    Route::get('/rentals/{rental}/pdf', [RentalController::class, 'generatePDF']);
    
    // Reportes
    Route::middleware('role:admin,accounting')->group(function () {
        Route::get('/reports/revenue', [ReportController::class, 'revenue']);
        Route::get('/reports/maintenance-costs', [ReportController::class, 'maintenanceCosts']);
        Route::get('/reports/fleet-availability', [ReportController::class, 'fleetAvailability']);
    });
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
