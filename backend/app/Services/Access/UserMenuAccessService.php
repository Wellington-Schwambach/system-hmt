<?php

namespace App\Services\Access;

use App\Models\User;
use Illuminate\Support\Arr;

class UserMenuAccessService
{
    /**
     * @return array<string, array<string, mixed>>
     */
    public function catalog(): array
    {
        return (array) config('hmt.access.permissions', []);
    }

    /**
     * @return list<string>
     */
    public function allPermissions(): array
    {
        return array_values(array_keys($this->catalog()));
    }

    /**
     * @return list<string>
     */
    public function permissionsFor(User $user): array
    {
        if ($this->isAdministrator($user)) {
            return $this->allPermissions();
        }

        $permissions = is_array($user->menu_permissions)
            ? $user->menu_permissions
            : $this->defaultsForProfile((string) $user->role);

        return array_values(array_intersect($permissions, $this->allPermissions()));
    }

    public function can(User $user, string $permission): bool
    {
        return $this->isAdministrator($user)
            || in_array($permission, $this->permissionsFor($user), true);
    }

    /**
     * @return list<string>
     */
    public function defaultsForProfile(string $profile): array
    {
        $defaults = Arr::get(config('hmt.access.profiles', []), $profile.'.permissions', []);

        return array_values(array_intersect((array) $defaults, $this->allPermissions()));
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function profiles(): array
    {
        return (array) config('hmt.access.profiles', []);
    }

    public function isAdministrator(User $user): bool
    {
        return mb_strtolower(trim((string) $user->role)) === 'administrador';
    }
}
