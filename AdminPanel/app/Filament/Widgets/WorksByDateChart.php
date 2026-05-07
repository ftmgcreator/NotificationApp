<?php

namespace App\Filament\Widgets;

use App\Models\Work;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class WorksByDateChart extends ChartWidget
{
    protected static ?string $heading = 'Kunlik ishlar';

    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 2;

    protected static ?string $pollingInterval = null;

    protected function getData(): array
    {
        $days   = collect(range(6, 0))->map(fn ($i) => Carbon::today()->subDays($i));
        $labels = $days->map(fn ($d) => $d->format('d.m'))->toArray();

        $smsData  = $days->map(fn ($d) => Work::where('type', 'sms')
            ->whereDate('created_at', $d)->count())->toArray();

        $callData = $days->map(fn ($d) => Work::where('type', 'call')
            ->whereDate('created_at', $d)->count())->toArray();

        return [
            'datasets' => [
                [
                    'label'           => 'SMS',
                    'data'            => $smsData,
                    'borderColor'     => '#6366f1',
                    'backgroundColor' => 'rgba(99,102,241,0.12)',
                    'borderWidth'     => 2,
                    'tension'         => 0.4,
                    'fill'            => true,
                    'pointRadius'     => 4,
                    'pointBackgroundColor' => '#6366f1',
                ],
                [
                    'label'           => 'Qo\'ng\'iroq',
                    'data'            => $callData,
                    'borderColor'     => '#22c55e',
                    'backgroundColor' => 'rgba(34,197,94,0.08)',
                    'borderWidth'     => 2,
                    'tension'         => 0.4,
                    'fill'            => true,
                    'pointRadius'     => 4,
                    'pointBackgroundColor' => '#22c55e',
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'top',
                    'labels'   => [
                        'color'      => '#94a3b8',
                        'padding'    => 16,
                        'font'       => ['size' => 12],
                        'usePointStyle' => true,
                        'pointStyleWidth' => 8,
                    ],
                ],
            ],
            'scales' => [
                'x' => [
                    'ticks' => ['color' => '#475569'],
                    'grid'  => ['color' => 'rgba(255,255,255,0.04)'],
                ],
                'y' => [
                    'ticks'     => ['color' => '#475569', 'stepSize' => 1],
                    'grid'      => ['color' => 'rgba(255,255,255,0.04)'],
                    'beginAtZero' => true,
                ],
            ],
        ];
    }
}
