<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'recommended_interval_km',
        'recommended_interval_months',
    ];

    protected $casts = [
        'recommended_interval_km' => 'decimal:2',
        'recommended_interval_months' => 'integer',
        'created_at' => 'datetime',
    ];

    public function maintenanceRecords()
    {
        return $this->hasMany(MaintenanceRecord::class);
    }
}
