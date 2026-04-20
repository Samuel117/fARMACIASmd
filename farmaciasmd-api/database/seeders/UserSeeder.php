<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@farmaciasmd.local'],
            [
                'name' => 'Admin FarmaciasMD',
                'password' => Hash::make('Admin1234!'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'empleado@farmaciasmd.local'],
            [
                'name' => 'Empleado FarmaciasMD',
                'password' => Hash::make('Empleado1234!'),
                'role' => 'employee',
            ]
        );
    }
}
