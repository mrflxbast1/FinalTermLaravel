<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'product_category_id' => ProductCategory::factory(),
            'sku' => fake()->unique()->bothify('SKU-######'),
            'name' => fake()->words(3, true), 'description' => fake()->sentence(),
            'price' => '125.00', 'quantity' => 25, 'low_stock_threshold' => 5,
            'is_active' => true, 'illustration' => 'box',
        ];
    }
}
