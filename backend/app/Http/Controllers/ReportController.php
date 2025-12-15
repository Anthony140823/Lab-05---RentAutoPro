<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rental;
use App\Models\MaintenanceRecord;
use App\Models\Vehicle;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function revenue(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->query('end_date', Carbon::now()->endOfMonth());

        $rentals = Rental::whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', ['completed', 'confirmed'])
            ->with(['vehicle', 'customer'])
            ->get();

        $totalRevenue = $rentals->sum('total_amount');
        $totalRentals = $rentals->count();
        $averageRentalValue = $totalRentals > 0 ? $totalRevenue / $totalRentals : 0;

        // Revenue por mes
        $monthlyRevenue = Rental::where('status', 'completed')
            ->whereYear('created_at', Carbon::now()->year)
            ->selectRaw('MONTH(created_at) as month, SUM(total_amount) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Revenue por tipo de vehículo
        $revenueByVehicleType = Rental::join('vehicles', 'rentals.vehicle_id', '=', 'vehicles.id')
            ->join('vehicle_types', 'vehicles.vehicle_type_id', '=', 'vehicle_types.id')
            ->where('rentals.status', 'completed')
            ->whereBetween('rentals.created_at', [$startDate, $endDate])
            ->selectRaw('vehicle_types.name as type, SUM(rentals.total_amount) as revenue')
            ->groupBy('vehicle_types.name')
            ->get();

        return response()->json([
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_rentals' => $totalRentals,
                'average_rental_value' => $averageRentalValue,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ],
            'monthly_revenue' => $monthlyRevenue,
            'revenue_by_vehicle_type' => $revenueByVehicleType,
            'rentals' => $rentals
        ]);
    }

    public function maintenanceCosts(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->query('end_date', Carbon::now()->endOfMonth());

        $maintenances = MaintenanceRecord::whereBetween('performed_at', [$startDate, $endDate])
            ->with(['vehicle', 'maintenanceType'])
            ->get();

        $totalCosts = $maintenances->sum('cost');
        $totalMaintenances = $maintenances->count();
        $averageCost = $totalMaintenances > 0 ? $totalCosts / $totalMaintenances : 0;

        // Costos por tipo de mantenimiento
        $costsByType = MaintenanceRecord::join('maintenance_types', 'maintenance_records.maintenance_type_id', '=', 'maintenance_types.id')
            ->whereBetween('maintenance_records.performed_at', [$startDate, $endDate])
            ->selectRaw('maintenance_types.name as type, SUM(maintenance_records.cost) as total_cost, COUNT(*) as count')
            ->groupBy('maintenance_types.name')
            ->orderBy('total_cost', 'desc')
            ->get();

        // Costos por vehículo
        $costsByVehicle = MaintenanceRecord::join('vehicles', 'maintenance_records.vehicle_id', '=', 'vehicles.id')
            ->whereBetween('maintenance_records.performed_at', [$startDate, $endDate])
            ->selectRaw('vehicles.make, vehicles.model, vehicles.license_plate, SUM(maintenance_records.cost) as total_cost, COUNT(*) as count')
            ->groupBy('vehicles.id', 'vehicles.make', 'vehicles.model', 'vehicles.license_plate')
            ->orderBy('total_cost', 'desc')
            ->get();

        // Costos mensuales
        $monthlyCosts = MaintenanceRecord::whereYear('performed_at', Carbon::now()->year)
            ->selectRaw('MONTH(performed_at) as month, SUM(cost) as cost')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'summary' => [
                'total_costs' => $totalCosts,
                'total_maintenances' => $totalMaintenances,
                'average_cost' => $averageCost,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ],
            'costs_by_type' => $costsByType,
            'costs_by_vehicle' => $costsByVehicle,
            'monthly_costs' => $monthlyCosts,
            'maintenances' => $maintenances
        ]);
    }

    public function fleetAvailability()
    {
        $totalVehicles = Vehicle::count();
        $availableVehicles = Vehicle::where('status', 'available')->count();
        $rentedVehicles = Vehicle::where('status', 'rented')->count();
        $maintenanceVehicles = Vehicle::where('status', 'maintenance')->count();
        $unavailableVehicles = Vehicle::where('status', 'unavailable')->count();

        // Disponibilidad por tipo de vehículo
        $availabilityByType = Vehicle::join('vehicle_types', 'vehicles.vehicle_type_id', '=', 'vehicle_types.id')
            ->selectRaw('vehicle_types.name as type, COUNT(*) as total, 
                        SUM(CASE WHEN vehicles.status = "available" THEN 1 ELSE 0 END) as available,
                        SUM(CASE WHEN vehicles.status = "rented" THEN 1 ELSE 0 END) as rented,
                        SUM(CASE WHEN vehicles.status = "maintenance" THEN 1 ELSE 0 END) as maintenance,
                        SUM(CASE WHEN vehicles.status = "unavailable" THEN 1 ELSE 0 END) as unavailable')
            ->groupBy('vehicle_types.id', 'vehicle_types.name')
            ->get();

        // Tasa de utilización (últimos 30 días)
        $utilizationRate = Rental::where('start_date', '>=', Carbon::now()->subDays(30))
            ->where('status', '!=', 'cancelled')
            ->distinct('vehicle_id')
            ->count();

        $utilizationPercentage = $totalVehicles > 0 ? ($utilizationRate / $totalVehicles) * 100 : 0;

        return response()->json([
            'summary' => [
                'total_vehicles' => $totalVehicles,
                'available' => $availableVehicles,
                'rented' => $rentedVehicles,
                'maintenance' => $maintenanceVehicles,
                'unavailable' => $unavailableVehicles,
                'utilization_rate' => round($utilizationPercentage, 2)
            ],
            'availability_by_type' => $availabilityByType,
            'vehicles' => Vehicle::with('vehicleType')->get()
        ]);
    }
}
