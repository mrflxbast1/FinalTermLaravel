<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'products.view', 'products.create', 'products.update', 'products.delete',
            'categories.view', 'categories.create', 'categories.update', 'categories.delete',
            'users.manage',
        ];

        foreach ($permissions as $name) {
            Permission::findOrCreate($name, 'web');
        }

        Role::findOrCreate('Admin', 'web')->syncPermissions($permissions);
        Role::findOrCreate('Manager', 'web')->syncPermissions(
            array_diff($permissions, ['categories.delete', 'users.manage'])
        );
        Role::findOrCreate('User', 'web')->syncPermissions([
            'dashboard.view', 'products.view', 'categories.view',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
