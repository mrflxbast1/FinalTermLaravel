<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_totals_use_inventory_records_and_low_stock_ignores_inactive_products(): void
    {
        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->actingAs(User::factory()->create()->assignRole('User'));
        Product::factory()->create(['price' => '19.95', 'quantity' => 3, 'low_stock_threshold' => 5, 'is_active' => true]);
        Product::factory()->create(['price' => '100.00', 'quantity' => 2, 'low_stock_threshold' => 0, 'is_active' => true]);
        Product::factory()->create(['price' => '8.00', 'quantity' => 0, 'low_stock_threshold' => 5, 'is_active' => false]);

        $this->get('/dashboard')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Index')
            ->where('stats.products', 3)
            ->where('stats.units', 5)
            ->where('stats.value', 259.85)
            ->where('stats.low_stock', 1)
            ->has('lowStockProducts', 1));
    }
}
