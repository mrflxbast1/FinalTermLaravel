<?php

use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;

Route::prefix('team')->name('team.')->middleware(['auth', 'role:Admin', 'permission:users.manage'])->group(function () {
    Route::get('/', [TeamController::class, 'index'])->name('index');
    Route::put('/{user}', [TeamController::class, 'update'])->name('update');
});
