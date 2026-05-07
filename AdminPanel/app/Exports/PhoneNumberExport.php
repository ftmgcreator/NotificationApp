<?php

namespace App\Exports;

use App\Models\PhoneNumber;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PhoneNumberExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return PhoneNumber::with('category')->get();
    }

    public function headings(): array
    {
        return ['Telefon raqam', 'Kategoriya', 'Status'];
    }

    public function map($row): array
    {
        return [
            $row->phone_number,
            $row->category?->name,
            $row->is_active ? 'Faol' : 'Nofaol',
        ];
    }
}
