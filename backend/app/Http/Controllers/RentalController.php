<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rental;
use App\Models\Vehicle;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;

class RentalController extends Controller
{
    public function index()
    {
        $rentals = Rental::with(['vehicle', 'customer'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($rentals);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|uuid|exists:vehicles,id',
            'customer_id' => 'required|uuid|exists:users,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'daily_rate' => 'required|numeric|min:0',
        ]);

        // Verificar disponibilidad del vehículo
        $isAvailable = $this->checkVehicleAvailability(
            $validated['vehicle_id'], 
            $validated['start_date'], 
            $validated['end_date']
        );

        if (!$isAvailable) {
            return response()->json(['message' => 'El vehículo no está disponible en las fechas seleccionadas'], 422);
        }

        // Calcular monto total
        $start = new \DateTime($validated['start_date']);
        $end = new \DateTime($validated['end_date']);
        $days = $start->diff($end)->days + 1;
        $totalAmount = $days * $validated['daily_rate'];

        $validated['total_amount'] = $totalAmount;
        $validated['status'] = 'pending';

        $rental = Rental::create($validated);
        
        return response()->json($rental->load(['vehicle', 'customer']), 201);
    }

    public function show(Rental $rental)
    {
        return response()->json($rental->load(['vehicle', 'customer', 'invoice']));
    }

    public function update(Request $request, Rental $rental)
    {
        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'daily_rate' => 'required|numeric|min:0',
        ]);

        // Verificar disponibilidad si cambian las fechas
        if ($rental->start_date != $validated['start_date'] || $rental->end_date != $validated['end_date']) {
            $isAvailable = $this->checkVehicleAvailability(
                $rental->vehicle_id, 
                $validated['start_date'], 
                $validated['end_date'],
                $rental->id
            );

            if (!$isAvailable) {
                return response()->json(['message' => 'El vehículo no está disponible en las fechas seleccionadas'], 422);
            }
        }

        // Recalcular monto total
        $start = new \DateTime($validated['start_date']);
        $end = new \DateTime($validated['end_date']);
        $days = $start->diff($end)->days + 1;
        $validated['total_amount'] = $days * $validated['daily_rate'];

        $rental->update($validated);
        
        return response()->json($rental->load(['vehicle', 'customer']));
    }

    public function destroy(Rental $rental)
    {
        $rental->delete();
        
        return response()->json(null, 204);
    }

    public function confirm(Rental $rental)
    {
        if ($rental->status !== 'pending') {
            return response()->json(['message' => 'Solo se pueden confirmar alquileres pendientes'], 422);
        }

        $rental->update(['status' => 'confirmed']);
        
        return response()->json($rental);
    }

    public function complete(Request $request, Rental $rental)
    {
        $validated = $request->validate([
            'end_mileage' => 'required|numeric|min:0',
        ]);

        if ($rental->status !== 'confirmed') {
            return response()->json(['message' => 'Solo se pueden completar alquileres confirmados'], 422);
        }

        $validated['status'] = 'completed';
        $validated['actual_return_date'] = now();

        $rental->update($validated);

        // Actualizar estado del vehículo
        $rental->vehicle->update(['status' => 'available']);
        
        return response()->json($rental);
    }

    public function generatePDF(Rental $rental)
    {
        $data = [
            'rental' => $rental->load(['vehicle', 'customer']),
            'company' => [
                'name' => 'RentAutoPro',
                'address' => 'Dirección de la empresa',
                'phone' => '+123456789',
                'email' => 'info@rentautopro.com'
            ]
        ];

        $pdf = PDF::loadView('pdf.rental', $data);
        
        return $pdf->download('alquiler-' . $rental->id . '.pdf');
    }

    public function byCustomer(User $customer)
    {
        $rentals = $customer->rentals()
            ->with(['vehicle'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($rentals);
    }

    public function byVehicle(Vehicle $vehicle)
    {
        $rentals = $vehicle->rentals()
            ->with(['customer'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($rentals);
    }

    private function checkVehicleAvailability($vehicleId, $startDate, $endDate, $excludeRentalId = null)
    {
        $query = Rental::where('vehicle_id', $vehicleId)
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function ($query) use ($startDate, $endDate) {
                          $query->where('start_date', '<=', $startDate)
                                ->where('end_date', '>=', $endDate);
                      });
            });

        if ($excludeRentalId) {
            $query->where('id', '!=', $excludeRentalId);
        }

        return $query->count() === 0;
    }
}
