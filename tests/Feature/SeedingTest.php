<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SeedingTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeders_create_demo_data_once_and_preserve_later_changes(): void
    {
        $this->seed();
        $this->assertDatabaseHas('users', ['email' => 'admin@stockroom.test']);
        $this->assertDatabaseCount('users', 3);
        $this->assertDatabaseCount('products', 24);
        $this->assertDatabaseCount('product_categories', 6);

        $admin = User::where('email', 'admin@stockroom.test')->firstOrFail();
        $admin->update(['password' => 'MyChangedPassword!']);
        $manager = User::where('email', 'manager@stockroom.test')->firstOrFail();
        $manager->syncRoles(['User']);
        $product = Product::firstOrFail();
        $product->update(['quantity' => 317, 'name' => 'My edited product']);
        $category = ProductCategory::firstOrFail();
        $category->update(['name' => 'Renamed category', 'slug' => 'renamed-category']);
        Product::where('id', '!=', $product->id)->firstOrFail()->delete();

        $this->seed();

        $this->assertSame(317, $product->fresh()->quantity);
        $this->assertSame('My edited product', $product->fresh()->name);
        $this->assertTrue(Hash::check('MyChangedPassword!', $admin->fresh()->password));
        $this->assertSame(['User'], $manager->fresh()->getRoleNames()->all());
        $this->assertDatabaseCount('products', 23);
        $this->assertDatabaseCount('product_categories', 6);
    }

    public function test_demo_seed_does_not_add_accounts_to_an_existing_installation(): void
    {
        User::factory()->create(['email' => 'owner@example.test']);
        $this->seed();

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('products', 0);
    }
}
