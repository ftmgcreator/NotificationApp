<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class PhoneNumberTemplateExport implements FromArray, WithTitle, WithColumnWidths, WithEvents
{
    public function array(): array
    {
        return [
            ['', 'Asosiy', 'Faol'],
            ['', 'Zaxira', 'Faol'],
        ];
    }

    public function title(): string
    {
        return 'Telefon Raqamlar';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 22,
            'B' => 20,
            'C' => 14,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $sheet->getStyle('A1:A100')
                    ->getNumberFormat()
                    ->setFormatCode(NumberFormat::FORMAT_TEXT);

                $sheet->insertNewRowBefore(1, 1);

                $sheet->setCellValueExplicit('A1', 'Telefon raqam', DataType::TYPE_STRING);
                $sheet->setCellValue('B1', 'Kategoriya');
                $sheet->setCellValue('C1', 'Status');

                $sheet->setCellValueExplicit('A2', '+998901234567', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('A3', '+998901234568', DataType::TYPE_STRING);

                $sheet->getStyle('A1:C1')->applyFromArray([
                    'font' => [
                        'bold'  => true,
                        'size'  => 11,
                        'color' => ['rgb' => 'FFFFFF'],
                    ],
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '1E293B'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical'   => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color'       => ['rgb' => '334155'],
                        ],
                    ],
                ]);

                $sheet->getRowDimension(1)->setRowHeight(28);

                $sheet->getStyle('A2:C3')->applyFromArray([
                    'font' => [
                        'size'  => 10,
                        'color' => ['rgb' => '334155'],
                    ],
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F8FAFC'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical'   => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color'       => ['rgb' => 'E2E8F0'],
                        ],
                    ],
                ]);

                $sheet->getStyle('A4:C100')->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color'       => ['rgb' => 'E2E8F0'],
                        ],
                    ],
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FFFFFF'],
                    ],
                ]);

                foreach (range(2, 3) as $row) {
                    $sheet->getRowDimension($row)->setRowHeight(22);
                }

                $sheet->getStyle('A1:C100')->getFont()->setName('Calibri');

                $sheet->setSelectedCell('A4');
            },
        ];
    }
}
