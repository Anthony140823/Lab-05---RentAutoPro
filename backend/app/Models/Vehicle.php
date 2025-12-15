<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'license_plate',
        'make',
        'model',
        'year',
        'vehicle_type_id',
        'color',
        'status',
        'current_mileage',
        'fuel_type',
        'fuel_efficiency',
        'last_maintenance_date',
        'next_maintenance_mileage',
    ];

    protected $casts = [
        'year' => 'integer',
        'current_mileage' => 'decimal:2',
        'fuel_efficiency' => 'decimal:2',
        'next_maintenance_mileage' => 'decimal:2',
        'last_maintenance_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function vehicleType()
    {
        return $this->belongsTo(VehicleType::class);
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function maintenanceRecords()
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    public function fuelRecords()
    {
        return $this->hasMany(FuelRecord::class);
    }

    public function isAvailable()
    {
        return $this->status === 'available';
    }

    public function isRented()
    {
        return $this->status === 'rented';
    }

    public function isInMaintenance()
    {
        return $this->status === 'maintenance';
    }

    public function isUnavailable()
    {
        return $this->status === 'unavailable';
    }

    public function needsMaintenance()
    {
        if ($this->next_maintenance_mileage && $this->current_mileage >= $this->next_maintenance_mileage) {
            return true;
        }

        return $this->maintenanceRecords()
            ->where('next_due_date', '<=', now())
            ->where('next_due_date', '>=', now())
            ->exists();
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeRented($query)
    {
        return $query->where('status', 'rented');
    }

    public function scopeInMaintenance($query)
    {
        return $query->where('status', 'maintenance');
    }
}
