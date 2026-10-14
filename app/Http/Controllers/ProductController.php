<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:products.view', only: ['index', 'show']),
            new Middleware('permission:products.create', only: ['create', 'store']),
            new Middleware('permission:products.update', only: ['edit', 'update']),
            new Middleware('permission:products.delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'integer', Rule::exists('product_categories', 'id')],
            'stock' => ['nullable', Rule::in(['all', 'low', 'out', 'healthy', 'inactive'])],
            'sort' => ['nullable', Rule::in(['name', 'price', 'quantity', 'updated_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
        ]);
        $query = Product::with('category');

        $search = $filters['search'] ?? '';
        if ($search !== '') {
            $query->where(fn ($query) => $query->where('name', 'like', '%'.$search.'%')
                ->orWhere('sku', 'like', '%'.$search.'%'));
        }
        if ($category = $filters['category'] ?? null) {
            $query->where('product_category_id', $category);
        }
        match ($filters['stock'] ?? 'all') {
            'low' => $query->where('is_active', true)->whereColumn('quantity', '<=', 'low_stock_threshold'),
            'out' => $query->where('is_active', true)->where('quantity', 0),
            'healthy' => $query->where('is_active', true)->whereColumn('quantity', '>', 'low_stock_threshold'),
            'inactive' => $query->where('is_active', false),
            default => null,
        };

        return Inertia::render('Products/Index', [
            'products' => $query->orderBy($filters['sort'] ?? 'name', $filters['direction'] ?? 'asc')
                ->orderBy('id')->paginate(10)->withQueryString(),
            'categories' => ProductCategory::orderBy('name')->get(['id', 'name', 'color']),
            'filters' => $filters,
            'summary' => [
                'total' => Product::count(),
                'low' => Product::where('is_active', true)->whereColumn('quantity', '<=', 'low_stock_threshold')->count(),
                'inactive' => Product::where('is_active', false)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Products/Create', $this->formOptions());
    }

    public function store(Request $request): RedirectResponse
    {
        $product = Product::create($this->validatedData($request));

        return to_route('products.show', $product)->with('success', 'Product added to your inventory.');
    }

    public function show(Product $product): Response
    {
        return Inertia::render('Products/Show', [
            'product' => $product->load('category'),
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Products/Edit', [
            ...$this->formOptions(), 'product' => $product,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $product->update($this->validatedData($request, $product));

        return to_route('products.show', $product)->with('success', 'Product updated.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return to_route('products.index')->with('success', 'Product removed from inventory.');
    }

    private function formOptions(): array
    {
        return [
            'categories' => ProductCategory::orderBy('name')->get(['id', 'name', 'color']),
            'illustrations' => Product::ILLUSTRATIONS,
        ];
    }

    private function validatedData(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'product_category_id' => ['required', 'integer', Rule::exists('product_categories', 'id')],
            'sku' => ['required', 'string', 'max:40', 'regex:/^[A-Za-z0-9_-]+$/', Rule::unique('products')->ignore($product)],
            'name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999.99'],
            'quantity' => ['required', 'integer', 'min:0', 'max:1000000'],
            'low_stock_threshold' => ['required', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
            'illustration' => ['required', Rule::in(Product::ILLUSTRATIONS)],
        ]);
    }
}
