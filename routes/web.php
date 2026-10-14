<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');
Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'permission:dashboard.view'])->name('dashboard');

require __DIR__.'/products.php';
require __DIR__.'/product-categories.php';
require __DIR__.'/team.php';
