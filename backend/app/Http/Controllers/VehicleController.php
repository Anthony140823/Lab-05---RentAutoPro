<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::with('vehicleType')->get();
        return response()->json($vehicles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'license_plate' => 'required|string|unique:vehicles',
            'make' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
            'vehicle_type_id' => 'nullable|uuid',
            'color' => 'nullable|string',
            'fuel_type' => 'nullable|string',
            'fuel_efficiency' => 'nullable|numeric|min:0',
            'current_mileage' => 'nullable|numeric|min:0',
        ]);

        $vehicle = Vehicle::create($validated);
        
        return response()->json($vehicle, 201);
    }

    public function show(Vehicle $vehicle)
    {
        return response()->json($vehicle->load(['vehicleType', 'maintenanceRecords']));
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'license_plate' => 'required|string|unique:vehicles,license_plate,' . $vehicle->id,
            'make' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
            'vehicle_type_id' => 'nullable|uuid',
            'color' => 'nullable|string',
            'fuel_type' => 'nullable|string',
            'fuel_efficiency' => 'nullable|numeric|min:0',
            'current_mileage' => 'nullable|numeric|min:0',
        ]);

        $vehicle->update($validated);
        
        return response()->json($vehicle);
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();
        
        return response()->json(null, 204);
    }

    public function available(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = Vehicle::where('status', 'available');

        if ($startDate && $endDate) {
            $query->whereDoesntHave('rentals', function ($q) use ($startDate, $endDate) {
                $q->where(function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('start_date', [$startDate, $endDate])
                          ->orWhereBetween('end_date', [$startDate, $endDate])
                          ->orWhere(function ($query) use ($startDate, $endDate) {
                              $query->where('start_date', '<=', $startDate)
                                    ->where('end_date', '>=', $endDate);
                          });
                });
            });
        }

        return response()->json($query->with('vehicleType')->get());
    }

    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'status' => 'required|in:available,rented,maintenance,unavailable',
        ]);

        $vehicle->update($validated);
        
        return response()->json($vehicle);
    }
}
