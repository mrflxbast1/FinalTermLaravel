<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Demo records belong only in a new installation. Never restore deleted samples.
        if (User::exists() || ProductCategory::exists() || Product::exists()) {
            return;
        }

        DB::transaction(function () {
            foreach ([
                ['Alex Morgan', 'admin@stockroom.test', 'Admin'],
                ['Jamie Santos', 'manager@stockroom.test', 'Manager'],
                ['Sam Rivera', 'user@stockroom.test', 'User'],
            ] as [$name, $email, $role]) {
                User::create([
                    'name' => $name, 'email' => $email, 'password' => 'Stockroom123!',
                ])->assignRole($role);
            }

            $categories = [];
            foreach ([
                ['Audio', 'audio', 'Sound essentials for focus, travel, and everyday listening.', 'lilac'],
                ['Desk & workspace', 'desk-workspace', 'Thoughtful tools for a more comfortable workday.', 'sage'],
                ['Everyday carry', 'everyday-carry', 'Useful things to take wherever the day leads.', 'peach'],
                ['Home & living', 'home-living', 'Small details that make a space feel like yours.', 'sand'],
                ['Photography', 'photography', 'Cameras and accessories for a different perspective.', 'blue'],
                ['Wearables', 'wearables', 'Practical technology that moves with you.', 'rose'],
            ] as [$name, $slug, $description, $color]) {
                $categories[$slug] = ProductCategory::create(compact('name', 'slug', 'description', 'color'));
            }

            $products = [
                ['AUD-001', 'Studio Headphones', 'audio', 'headphones', 6490, 24, 5, 'Over-ear wireless headphones with soft cushions and a balanced sound.'],
                ['DSK-001', 'Arc Desk Lamp', 'desk-workspace', 'lamp', 1890, 4, 5, 'An adjustable task light with a warm, diffused glow.'],
                ['DSK-002', 'Mono Mechanical Keyboard', 'desk-workspace', 'keyboard', 4290, 18, 5, 'A compact keyboard with tactile switches and a quiet, solid feel.'],
                ['CAR-001', 'Everyday Backpack', 'everyday-carry', 'bag', 2490, 32, 8, 'A lightweight daily bag with a padded laptop compartment.'],
                ['AUD-002', 'Orbit Portable Speaker', 'audio', 'speaker', 3290, 2, 5, 'Room-filling sound in a small, easy-to-carry design.'],
                ['CAM-001', 'Focus Digital Camera', 'photography', 'camera', 14990, 8, 3, 'A compact camera for everyday photography and weekend trips.'],
                ['CAR-002', 'Nomad Water Bottle', 'everyday-carry', 'bottle', 790, 45, 10, 'Double-wall insulation keeps your daily hydration close at hand.'],
                ['WCH-001', 'Frame Smart Watch', 'wearables', 'watch', 2990, 0, 5, 'A clear display and simple activity tracking for everyday movement.'],
                ['DSK-003', 'Mesh Task Chair', 'desk-workspace', 'chair', 7990, 12, 3, 'Breathable mesh and an adjustable seat for longer work sessions.'],
                ['DSK-004', 'Daily Notebook Set', 'desk-workspace', 'notebook', 290, 68, 15, 'Three lay-flat notebooks for notes, ideas, and everything in between.'],
                ['HOM-001', 'Monstera Desk Planter', 'home-living', 'plant', 690, 16, 4, 'A leafy desk companion in a matte ceramic planter.'],
                ['DSK-005', 'Glide Wireless Mouse', 'desk-workspace', 'mouse', 1590, 27, 8, 'A comfortable wireless mouse with precise, smooth tracking.'],
                ['AUD-003', 'Travel Headphones', 'audio', 'headphones', 3490, 21, 5, 'Foldable headphones made for a lighter commute.'],
                ['HOM-002', 'Pebble Bedside Lamp', 'home-living', 'lamp', 1290, 19, 4, 'Soft ambient lighting for a calmer evening.'],
                ['CAR-003', 'Weekend Duffel', 'everyday-carry', 'bag', 2190, 11, 4, 'A roomy carryall with reinforced handles and an inside pocket.'],
                ['WCH-002', 'Tempo Fitness Watch', 'wearables', 'watch', 1790, 14, 5, 'A lightweight activity tracker with an easy-to-read face.'],
                ['CAM-002', 'Pocket Film Camera', 'photography', 'camera', 2490, 6, 3, 'A reusable film camera for slowing down and seeing more.'],
                ['HOM-003', 'Olive Ceramic Planter', 'home-living', 'plant', 590, 23, 5, 'A small glazed planter with a removable drainage tray.'],
                ['AUD-004', 'Mini Desktop Speaker', 'audio', 'speaker', 1490, 3, 5, 'Compact desktop sound with a simple volume dial.'],
                ['CAR-004', 'Insulated Travel Flask', 'everyday-carry', 'bottle', 990, 38, 10, 'A secure, easy-clean flask for hot drinks on the move.'],
                ['DSK-006', 'Compact Keypad', 'desk-workspace', 'keyboard', 1990, 17, 5, 'An efficient compact layout for smaller desk setups.'],
                ['HOM-004', 'Reading Chair', 'home-living', 'chair', 8990, 5, 2, 'A comfortable occasional chair with a clean timber frame.'],
                ['CAM-003', 'Camera Travel Bag', 'photography', 'bag', 1590, 9, 3, 'A padded compact bag that keeps the essentials organized.'],
                ['WCH-003', 'Classic Digital Watch', 'wearables', 'watch', 1290, 20, 5, 'A simple, dependable digital watch with a soft strap.'],
            ];

            foreach ($products as $index => [$sku, $name, $slug, $illustration, $price, $quantity, $threshold, $description]) {
                Product::create([
                    'product_category_id' => $categories[$slug]->id,
                    'sku' => $sku, 'name' => $name, 'description' => $description,
                    'price' => $price, 'quantity' => $quantity, 'low_stock_threshold' => $threshold,
                    'is_active' => true, 'illustration' => $illustration,
                ]);
            }
        });
    }
}
