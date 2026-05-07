<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\PhoneNumber;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithUpserts;

class PhoneNumberImport implements ToModel, WithHeadingRow, WithUpserts
{
    public function model(array $row): ?PhoneNumber
    {
        if (empty($row['telefon_raqam'])) {
            return null;
        }

        $category = Category::firstOrCreate(['name' => $row['kategoriya'] ?? 'Umumiy']);

        return new PhoneNumber([
            'phone_number' => $row['telefon_raqam'],
            'category_id'  => $category->id,
            'is_active'    => ($row['status'] ?? 'Faol') === 'Faol',
        ]);
    }

    public function uniqueBy(): string
    {
        return 'phone_number';
    }
}
