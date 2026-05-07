<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::query()->updateOrCreate([
            'email' => 'manager@example.com',
        ], [
            'name' => 'Manager User',
            'password' => 'password',
            'role' => 'manager',
        ]);

        User::query()->updateOrCreate([
            'email' => 'partner@example.com',
        ], [
            'name' => 'Partner User',
            'password' => 'password',
            'role' => 'partner',
        ]);

        User::query()->updateOrCreate([
            'email' => 'visitor@example.com',
        ], [
            'name' => 'Visitor User',
            'password' => 'password',
            'role' => 'visitor',
        ]);
    }
}
