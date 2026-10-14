<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    public const ILLUSTRATIONS = [
        'headphones', 'keyboard', 'mouse', 'speaker', 'camera', 'watch',
        'lamp', 'chair', 'plant', 'notebook', 'bottle', 'bag', 'box',
    ];

    protected $fillable = [
        'product_category_id', 'sku', 'name', 'description', 'price',
        'quantity', 'low_stock_threshold', 'is_active', 'illustration',
    ];

    protected $appends = ['stock_status'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    public function getStockStatusAttribute(): string
    {
        if (! $this->is_active) {
            return 'inactive';
        }

        return match (true) {
            $this->quantity === 0 => 'out',
            $this->quantity <= $this->low_stock_threshold => 'low',
            default => 'healthy',
        };
    }
}
