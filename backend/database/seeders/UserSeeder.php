<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Compte Administrateur

        User::create([
            'name' => 'Admin Restaurant',
            'email' => 'admin@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'admin',

        ]);

        // Compte Cuisinier
        
        User::create([
            'name' => 'Chef cuisinier',
            'email' => 'cook@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'cook',
        ]);

        // Compte Client
        User::create([
            'name' => 'Client Test',
            'email' => 'client@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);
    }
}
