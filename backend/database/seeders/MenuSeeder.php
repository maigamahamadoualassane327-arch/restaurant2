<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Dish;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $menu = [
            'Entrées' => [
                ['Salade César', 'Poulet grillé, croûtons, parmesan', 8.50],
                ['Soupe du jour', 'Soupe maison de saison', 6.00],
            ],
            'Plats' => [
                ['Burger maison', 'Bœuf, cheddar, frites', 14.00],
                ['Pizza Margherita', 'Tomate, mozzarella, basilic', 12.00],
            ],
            'Desserts' => [
                ['Tiramisu', 'Mascarpone et café', 6.50],
                ['Fondant au chocolat', 'Coulant, servi chaud', 7.00],
            ],
        ];

        foreach ($menu as $categoryName => $dishes) {
            $category = Category::firstOrCreate(['name' => $categoryName]);

            foreach ($dishes as [$name, $description, $price]) {
                Dish::updateOrCreate(
                    ['name' => $name, 'category_id' => $category->id],
                    ['description' => $description, 'price' => $price, 'is_available' => true]
                );
            }
        }
    }
}