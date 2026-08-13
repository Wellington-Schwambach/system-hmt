<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'name',
        'username',
        'phone',
        'password',
        'role',
        'is_active',
        'theme_preference',
        'menu_permissions',
        'access_schedule_enabled',
        'access_start_time',
        'access_end_time',
        'access_days',
        'access_timezone',
        'saturday_access_enabled',
        'saturday_start_time',
        'saturday_end_time',
        'sunday_access_enabled',
        'sunday_start_time',
        'sunday_end_time',
        'temporary_access_until',
        'temporary_access_ip',
        'temporary_access_granted_by',
        'temporary_access_granted_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function username(): Attribute
    {
        return Attribute::make(
            set: static fn (string $value): string => Str::lower(trim($value)),
        );
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'immutable_datetime',
            'theme_preference' => 'string',
            'menu_permissions' => 'array',
            'access_schedule_enabled' => 'boolean',
            'access_days' => 'array',
            'saturday_access_enabled' => 'boolean',
            'sunday_access_enabled' => 'boolean',
            'temporary_access_until' => 'immutable_datetime',
            'temporary_access_granted_at' => 'immutable_datetime',
        ];
    }
}
