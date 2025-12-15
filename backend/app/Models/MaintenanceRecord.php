<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'maintenance_type_id',
        'performed_by',
        'description',
        'cost',
        'mileage',
        'performed_at',
        'next_due_mileage',
        'next_due_date',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'mileage' => 'decimal:2',
        'next_due_mileage' => 'decimal:2',
        'performed_at' => 'datetime',
        'next_due_date' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function maintenanceType()
    {
        return $this->belongsTo(MaintenanceType::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function isOverdue()
    {
        if ($this->next_due_date && $this->next_due_date->isPast()) {
            return true;
        }

        if ($this->next_due_mileage && $this->vehicle) {
            return $this->vehicle->current_mileage >= $this->next_due_mileage;
        }

        return false;
    }

    public function isUpcoming()
    {
        if ($this->next_due_date) {
            return $this->next_due_date->between(now(), now()->addDays(30));
        }

        return false;
    }

    public function scopeScheduled($query)
    {
        return $query->where('next_due_date', '<=', now()->addDays(30))
                    ->where('next_due_date', '>=', now());
    }

    public function scopeOverdue($query)
    {
        return $query->where('next_due_date', '<', now())
                    ->orWhere(function ($query) {
                        $query->whereHas('vehicle', function ($vehicleQuery) {
                            $vehicleQuery->whereRaw('current_mileage >= next_maintenance_mileage');
                        });
                    });
    }
}
