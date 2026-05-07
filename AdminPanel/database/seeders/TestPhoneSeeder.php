<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\PhoneNumber;
use Illuminate\Database\Seeder;

class TestPhoneSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::firstOrCreate(['name' => 'Test']);

        $numbers = [];
        $generated = [];

        while (count($numbers) < 50) {
            $number = '+9989' . str_pad(rand(0, 99999999), 8, '0', STR_PAD_LEFT);

            if (in_array($number, $generated)) {
                continue;
            }

            $generated[] = $number;
            $numbers[] = [
                'phone_number' => $number,
                'category_id'  => $category->id,
                'is_active'    => rand(0, 1),
                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        }

        PhoneNumber::insert($numbers);

        $this->command->info('50 ta test raqam yaratildi.');
    }
}
