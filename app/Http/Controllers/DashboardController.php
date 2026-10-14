<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $lowStock = Product::where('is_active', true)->whereColumn('quantity', '<=', 'low_stock_threshold');

        // Sum minor currency units so fractional prices do not accumulate rounding errors.
        $valueInCents = Product::selectRaw('COALESCE(SUM(ROUND(price * 100) * quantity), 0) as total')->value('total');

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'products' => Product::count(),
                'units' => (int) Product::sum('quantity'),
                'value' => round($valueInCents / 100, 2),
                'low_stock' => (clone $lowStock)->count(),
                'out_of_stock' => Product::where('is_active', true)->where('quantity', 0)->count(),
                'categories' => ProductCategory::count(),
            ],
            'lowStockProducts' => $lowStock->with('category')->orderBy('quantity')->orderBy('name')->limit(5)->get(),
            'categoryBreakdown' => ProductCategory::withCount('products')->orderByDesc('products_count')->get(),
            'recentProducts' => Product::with('category')->latest('updated_at')->limit(5)->get(),
        ]);
    }
}
