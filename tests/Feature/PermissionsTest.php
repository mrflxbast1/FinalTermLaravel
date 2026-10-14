<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->withoutVite();
    }

    #[DataProvider('roles')]
    public function test_resource_pages_enforce_roles(string $role, bool $canWrite): void
    {
        $this->actingAs(User::factory()->create()->assignRole($role));
        $product = Product::factory()->create();
        $category = $product->category;

        foreach (['/dashboard', '/products', '/products/'.$product->id, '/categories', '/categories/'.$category->id] as $url) {
            $this->get($url)->assertOk();
        }
        foreach (['/products/create', '/products/'.$product->id.'/edit', '/categories/create', '/categories/'.$category->id.'/edit'] as $url) {
            $this->get($url)->assertStatus($canWrite ? 200 : 403);
        }
    }

    public static function roles(): array
    {
        return [['Admin', true], ['Manager', true], ['User', false]];
    }

    public function test_read_only_users_cannot_write_by_submitting_requests_directly(): void
    {
        $this->actingAs(User::factory()->create()->assignRole('User'));
        $product = Product::factory()->create();
        $category = $product->category;

        foreach ([
            ['post', '/products'], ['put', '/products/'.$product->id], ['delete', '/products/'.$product->id],
            ['post', '/categories'], ['put', '/categories/'.$category->id], ['delete', '/categories/'.$category->id],
        ] as [$method, $url]) {
            $this->{$method}($url, [])->assertForbidden();
        }
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_managers_can_delete_products_but_cannot_delete_categories(): void
    {
        $this->actingAs(User::factory()->create()->assignRole('Manager'));
        $product = Product::factory()->create();
        $category = $product->category;

        $this->delete('/categories/'.$category->id)->assertForbidden();
        $this->assertDatabaseHas('products', ['id' => $product->id]);
        $this->delete('/products/'.$product->id)->assertRedirect('/products');
        $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
    }

    public function test_unauthenticated_writes_redirect_to_login(): void
    {
        $this->post('/products', [])->assertRedirect('/login');
        $this->post('/categories', [])->assertRedirect('/login');
    }
}
