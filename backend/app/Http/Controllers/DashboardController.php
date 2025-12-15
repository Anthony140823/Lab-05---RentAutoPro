<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Rental;
use App\Models\MaintenanceRecord;
use App\Models\User;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // KPIs principales
        $totalVehicles = Vehicle::count();
        $availableVehicles = Vehicle::where('status', 'available')->count();
        $rentedVehicles = Vehicle::where('status', 'rented')->count();
        $maintenanceVehicles = Vehicle::where('status', 'maintenance')->count();

        // Mantenimientos pendientes
        $pendingMaintenances = MaintenanceRecord::where('next_due_date', '<=', now()->addDays(7))
            ->where('next_due_date', '>=', now())
            ->count();

        // Alertas activas (vehículos que necesitan mantenimiento pronto)
        $activeAlerts = Vehicle::whereRaw('(current_mileage >= next_maintenance_mileage OR next_maintenance_mileage IS NULL)')
            ->orWhereHas('maintenanceRecords', function ($query) {
                $query->where('next_due_date', '<=', now()->addDays(30))
                      ->where('next_due_date', '>=', now());
            })
            ->count();

        // Ingresos del mes
        $monthlyRevenue = Rental::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->where('status', 'completed')
            ->sum('total_amount');

        // Alquileres activos
        $activeRentals = Rental::whereIn('status', ['confirmed', 'in_progress'])->count();

        // Nuevos clientes del mes
        $newCustomers = User::where('role', 'customer')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // Tasa de utilización de flota
        $utilizationRate = $totalVehicles > 0 ? ($rentedVehicles / $totalVehicles) * 100 : 0;

        // Tendencias de ingresos (últimos 6 meses)
        $revenueTrends = Rental::where('status', 'completed')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total_amount) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Vehículos más rentables
        $topVehicles = Rental::join('vehicles', 'rentals.vehicle_id', '=', 'vehicles.id')
            ->where('rentals.status', 'completed')
            ->where('rentals.created_at', '>=', Carbon::now()->subMonths(3))
            ->selectRaw('vehicles.make, vehicles.model, vehicles.license_plate, 
                        COUNT(*) as rental_count, SUM(rentals.total_amount) as total_revenue')
            ->groupBy('vehicles.id', 'vehicles.make', 'vehicles.model', 'vehicles.license_plate')
            ->orderBy('total_revenue', 'desc')
            ->limit(5)
            ->get();

        // Mantenimientos próximos
        $upcomingMaintenances = MaintenanceRecord::where('next_due_date', '<=', now()->addDays(30))
            ->where('next_due_date', '>=', now())
            ->with(['vehicle', 'maintenanceType'])
            ->orderBy('next_due_date')
            ->limit(10)
            ->get();

        // Actividad reciente de alquileres
        $recentRentals = Rental::with(['vehicle', 'customer'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'kpis' => [
                'total_vehicles' => $totalVehicles,
                'available_vehicles' => $availableVehicles,
                'rented_vehicles' => $rentedVehicles,
                'maintenance_vehicles' => $maintenanceVehicles,
                'pending_maintenances' => $pendingMaintenances,
                'active_alerts' => $activeAlerts,
                'monthly_revenue' => $monthlyRevenue,
                'active_rentals' => $activeRentals,
                'new_customers' => $newCustomers,
                'utilization_rate' => round($utilizationRate, 2)
            ],
            'charts' => [
                'revenue_trends' => $revenueTrends,
                'top_vehicles' => $topVehicles
            ],
            'alerts' => [
                'upcoming_maintenances' => $upcomingMaintenances,
                'recent_rentals' => $recentRentals
            ]
        ]);
    }
}
