<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'first_name',
        'last_name',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function rentals()
    {
        return $this->hasMany(Rental::class, 'customer_id');
    }

    public function maintenanceRecords()
    {
        return $this->hasMany(MaintenanceRecord::class, 'performed_by');
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isFleetManager()
    {
        return $this->role === 'fleet_manager';
    }

    public function isCustomer()
    {
        return $this->role === 'customer';
    }

    public function isMechanic()
    {
        return $this->role === 'mechanic';
    }

    public function isAccounting()
    {
        return $this->role === 'accounting';
    }
}
