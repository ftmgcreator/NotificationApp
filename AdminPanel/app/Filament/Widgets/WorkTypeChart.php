<?php

namespace App\Filament\Widgets;

use App\Models\Work;
use Filament\Widgets\ChartWidget;

class WorkTypeChart extends ChartWidget
{
    protected static ?string $heading = 'Tur bo\'yicha taqsimot';

    protected static ?int $sort = 1;

    protected int|string|array $columnSpan = 1;

    protected static ?string $pollingInterval = null;

    protected function getData(): array
    {
        $sms  = Work::where('type', 'sms')->count();
        $call = Work::where('type', 'call')->count();

        return [
            'datasets' => [
                [
                    'data'                 => [$sms, $call],
                    'backgroundColor'      => ['#6366f1', '#22c55e'],
                    'hoverBackgroundColor' => ['#818cf8', '#4ade80'],
                    'borderWidth'          => 0,
                ],
            ],
            'labels' => ['SMS', 'Qo\'ng\'iroq'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                    'labels'   => [
                        'color'   => '#94a3b8',
                        'padding' => 16,
                        'font'    => ['size' => 12],
                    ],
                ],
            ],
            'cutout' => '65%',
        ];
    }
}
