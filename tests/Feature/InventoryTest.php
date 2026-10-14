<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->actingAs(User::factory()->create()->assignRole('Admin'));
        $this->withoutVite();
    }

    public function test_inventory_list_is_available_to_an_authorized_user(): void
    {
        $this->get('/products')->assertOk();
    }

    public function test_products_can_be_created_updated_viewed_and_deleted(): void
    {
        $category = ProductCategory::factory()->create();
        $data = $this->productData($category);

        $this->post('/products', $data)->assertRedirect();
        $product = Product::where('sku', 'DESK-001')->firstOrFail();
        $this->assertSame('2199.50', $product->price);
        $this->assertSame($category->id, $product->category->id);

        $this->get('/products/'.$product->id)->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Products/Show')->where('product.name', 'Desk lamp'));

        $this->put('/products/'.$product->id, [...$data, 'quantity' => 43])->assertRedirect();
        $this->assertSame(43, $product->fresh()->quantity);
        $this->delete('/products/'.$product->id)->assertRedirect('/products');
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_invalid_inventory_data_never_reaches_the_database(): void
    {
        $this->post('/products', [
            'name' => '', 'sku' => '', 'product_category_id' => 99999,
            'price' => -1, 'quantity' => -3, 'low_stock_threshold' => -1,
            'is_active' => true, 'illustration' => '../../secret',
        ])->assertSessionHasErrors([
            'name', 'sku', 'product_category_id', 'price', 'quantity',
            'low_stock_threshold', 'illustration',
        ]);
        $this->assertDatabaseCount('products', 0);
    }

    public function test_skus_are_unique_but_can_be_kept_when_editing_their_product(): void
    {
        $category = ProductCategory::factory()->create();
        $product = Product::factory()->for($category, 'category')->create(['sku' => 'DESK-001']);
        $data = $this->productData($category);

        $this->post('/products', $data)->assertSessionHasErrors('sku');
        $this->put('/products/'.$product->id, $data)->assertSessionHasNoErrors();
    }

    public function test_categories_have_complete_crud_and_deletion_cascades_only_to_their_products(): void
    {
        $this->post('/categories', ['name' => 'Desk essentials', 'description' => 'For a better workspace.', 'color' => 'sage'])
            ->assertRedirect();
        $category = ProductCategory::where('slug', 'desk-essentials')->firstOrFail();
        $owned = Product::factory()->for($category, 'category')->create();
        $other = Product::factory()->create();

        $this->get('/categories/'.$category->id)->assertOk();
        $this->put('/categories/'.$category->id, ['name' => 'Desk tools', 'description' => 'Updated.', 'color' => 'blue'])
            ->assertSessionHasNoErrors();
        $this->assertSame('desk-tools', $category->fresh()->slug);

        $this->delete('/categories/'.$category->id)->assertRedirect('/categories');
        $this->assertDatabaseMissing('products', ['id' => $owned->id]);
        $this->assertDatabaseHas('products', ['id' => $other->id]);
    }

    public function test_duplicate_category_names_are_rejected(): void
    {
        ProductCategory::factory()->create(['name' => 'Desk', 'slug' => 'desk']);
        $this->post('/categories', ['name' => 'Desk', 'color' => 'sage'])
            ->assertSessionHasErrors('name');
    }

    public function test_search_category_and_stock_filters_can_be_combined(): void
    {
        $category = ProductCategory::factory()->create();
        $match = Product::factory()->for($category, 'category')->create([
            'name' => 'Orbit desk lamp', 'quantity' => 2, 'low_stock_threshold' => 5, 'is_active' => true,
        ]);
        Product::factory()->for($category, 'category')->create(['name' => 'Orbit chair', 'quantity' => 100]);
        Product::factory()->create(['name' => 'Orbit other lamp', 'quantity' => 1]);

        $this->get('/products?search=Orbit&category='.$category->id.'&stock=low')
            ->assertInertia(fn (Assert $page) => $page->has('products.data', 1)
                ->where('products.data.0.id', $match->id)
                ->where('filters.search', 'Orbit'));
    }

    public function test_zero_is_a_valid_search_term(): void
    {
        $match = Product::factory()->create(['name' => 'Desk lamp', 'sku' => 'DESK-0']);
        Product::factory()->create(['name' => 'Plain notebook', 'sku' => 'PAPER-A']);

        $this->get('/products?search=0')
            ->assertInertia(fn (Assert $page) => $page->has('products.data', 1)
                ->where('products.data.0.id', $match->id));
    }

    public function test_lists_are_paginated_and_ordering_is_validated(): void
    {
        Product::factory()->count(15)->create();
        $this->get('/products?sort=quantity&direction=desc')
            ->assertInertia(fn (Assert $page) => $page->has('products.data', 10)->where('products.total', 15));
        $this->get('/products?sort=quantity%3BDELETE')->assertSessionHasErrors('sort');
    }

    private function productData(ProductCategory $category): array
    {
        return [
            'product_category_id' => $category->id, 'name' => 'Desk lamp', 'sku' => 'DESK-001',
            'description' => 'A small task light.', 'price' => '2199.50', 'quantity' => 12,
            'low_stock_threshold' => 5, 'is_active' => true, 'illustration' => 'lamp',
        ];
    }
}
