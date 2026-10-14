<?php

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Hash;

// Used only against the isolated release copy created by portable-smoke.ps1.
require $argv[1].'/vendor/autoload.php';
$app = require $argv[1].'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$admin = User::where('email', 'admin@stockroom.test')->firstOrFail();
$product = Product::orderBy('id')->firstOrFail();
if (($argv[2] ?? 'inspect') === 'mutate') {
    $product->update(['quantity' => 317]);
    $admin->update(['password' => 'PortableTest!234']);
    User::firstOrCreate(['email' => 'portable-test@stockroom.test'], [
        'name' => 'Portable test', 'password' => 'PortableTest!234',
    ])->assignRole('User');
}

echo json_encode([
    'users' => User::count(),
    'products' => Product::count(),
    'categories' => ProductCategory::count(),
    'quantity' => $product->fresh()->quantity,
    'adminLogin' => Hash::check('Stockroom123!', $admin->fresh()->password),
    'changedPassword' => Hash::check('PortableTest!234', $admin->fresh()->password),
]);
