<?php

use App\Http\Controllers\ProductCategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::resource('categories', ProductCategoryController::class)
        ->names('product-categories')->parameters(['categories' => 'category']);
});
