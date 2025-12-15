<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'rental_id',
        'fuel_amount',
        'fuel_cost',
        'mileage',
        'fuel_type',
        'notes',
        'filled_at',
    ];

    protected $casts = [
        'fuel_amount' => 'decimal:2',
        'fuel_cost' => 'decimal:2',
        'mileage' => 'decimal:2',
        'filled_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function getFuelEfficiency()
    {
        if (!$this->vehicle_id) {
            return null;
        }

        $previousRecord = FuelRecord::where('vehicle_id', $this->vehicle_id)
            ->where('filled_at', '<', $this->filled_at)
            ->orderBy('filled_at', 'desc')
            ->first();

        if ($previousRecord) {
            $distance = $this->mileage - $previousRecord->mileage;
            return $distance > 0 ? $distance / $this->fuel_amount : null;
        }

        return null;
    }
}
