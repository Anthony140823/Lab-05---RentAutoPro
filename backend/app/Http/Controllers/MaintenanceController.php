<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaintenanceRecord;
use App\Models\Vehicle;

class MaintenanceController extends Controller
{
    public function index()
    {
        $maintenances = MaintenanceRecord::with(['vehicle', 'maintenanceType', 'performedBy'])
            ->orderBy('performed_at', 'desc')
            ->get();
        
        return response()->json($maintenances);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|uuid|exists:vehicles,id',
            'maintenance_type_id' => 'nullable|uuid|exists:maintenance_types,id',
            'description' => 'required|string',
            'cost' => 'nullable|numeric|min:0',
            'mileage' => 'required|numeric|min:0',
            'next_due_mileage' => 'nullable|numeric|min:0',
            'next_due_date' => 'nullable|date',
        ]);

        $maintenance = MaintenanceRecord::create($validated);
        
        // Actualizar kilometraje del vehículo
        $vehicle = Vehicle::find($validated['vehicle_id']);
        $vehicle->update(['current_mileage' => $validated['mileage']]);
        
        return response()->json($maintenance->load(['vehicle', 'maintenanceType']), 201);
    }

    public function show(MaintenanceRecord $maintenance)
    {
        return response()->json($maintenance->load(['vehicle', 'maintenanceType', 'performedBy']));
    }

    public function update(Request $request, MaintenanceRecord $maintenance)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|uuid|exists:vehicles,id',
            'maintenance_type_id' => 'nullable|uuid|exists:maintenance_types,id',
            'description' => 'required|string',
            'cost' => 'nullable|numeric|min:0',
            'mileage' => 'required|numeric|min:0',
            'next_due_mileage' => 'nullable|numeric|min:0',
            'next_due_date' => 'nullable|date',
        ]);

        $maintenance->update($validated);
        
        return response()->json($maintenance->load(['vehicle', 'maintenanceType']));
    }

    public function destroy(MaintenanceRecord $maintenance)
    {
        $maintenance->delete();
        
        return response()->json(null, 204);
    }

    public function byVehicle(Vehicle $vehicle)
    {
        $maintenances = $vehicle->maintenanceRecords()
            ->with(['maintenanceType', 'performedBy'])
            ->orderBy('performed_at', 'desc')
            ->get();
        
        return response()->json($maintenances);
    }

    public function scheduled()
    {
        $scheduledMaintenances = MaintenanceRecord::where('next_due_date', '<=', now()->addDays(30))
            ->where('next_due_date', '>=', now())
            ->with(['vehicle', 'maintenanceType'])
            ->orderBy('next_due_date')
            ->get();
        
        return response()->json($scheduledMaintenances);
    }
}
