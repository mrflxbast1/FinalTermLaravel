<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:categories.view', only: ['index', 'show']),
            new Middleware('permission:categories.create', only: ['create', 'store']),
            new Middleware('permission:categories.update', only: ['edit', 'update']),
            new Middleware('permission:categories.delete', only: ['destroy']),
        ];
    }

    public function index(): Response
    {
        return Inertia::render('Categories/Index', [
            'categories' => ProductCategory::withCount('products')->withSum('products', 'quantity')
                ->orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Categories/Create', ['colors' => ProductCategory::COLORS]);
    }

    public function store(Request $request): RedirectResponse
    {
        $category = ProductCategory::create($this->validatedData($request));

        return to_route('product-categories.show', $category)->with('success', 'Category created.');
    }

    public function show(ProductCategory $category): Response
    {
        return Inertia::render('Categories/Show', [
            'category' => $category->loadCount('products'),
            'products' => $category->products()->with('category')->orderBy('name')->paginate(10),
        ]);
    }

    public function edit(ProductCategory $category): Response
    {
        return Inertia::render('Categories/Edit', [
            'category' => $category, 'colors' => ProductCategory::COLORS,
        ]);
    }

    public function update(Request $request, ProductCategory $category): RedirectResponse
    {
        $category->update($this->validatedData($request, $category));

        return to_route('product-categories.show', $category)->with('success', 'Category updated.');
    }

    public function destroy(ProductCategory $category): RedirectResponse
    {
        $category->delete();

        return to_route('product-categories.index')->with('success', 'Category and its products removed.');
    }

    private function validatedData(Request $request, ?ProductCategory $category = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('product_categories')->ignore($category)],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['required', Rule::in(ProductCategory::COLORS)],
        ]);

        $base = Str::slug($data['name']) ?: 'category';
        $slug = $base;
        $suffix = 2;
        while (ProductCategory::where('slug', $slug)->when($category, fn ($query) => $query->whereKeyNot($category->id))->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return [...$data, 'slug' => $slug];
    }
}
