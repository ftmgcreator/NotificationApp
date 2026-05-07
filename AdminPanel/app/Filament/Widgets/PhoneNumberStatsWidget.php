<?php

namespace App\Filament\Widgets;

use App\Models\Category;
use App\Models\PhoneNumber;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class PhoneNumberStatsWidget extends BaseWidget
{
    protected static ?string $pollingInterval = null;

    protected static bool $isLazy = true;

    public const CACHE_KEY = 'phone_number_stats';

    protected function getStats(): array
    {
        $stats = Cache::rememberForever(self::CACHE_KEY, function () {
            return [
                'total'    => PhoneNumber::count(),
                'active'   => PhoneNumber::where('is_active', true)->count(),
                'inactive' => PhoneNumber::where('is_active', false)->count(),
                'cats'     => Category::count(),
            ];
        });

        return [
            Stat::make('Jami raqamlar', $stats['total'])
                ->icon('heroicon-o-phone')
                ->color('gray'),

            Stat::make('Faol', $stats['active'])
                ->icon('heroicon-o-check-circle')
                ->color('success'),

            Stat::make('Nofaol', $stats['inactive'])
                ->icon('heroicon-o-x-circle')
                ->color('danger'),

            Stat::make('Kategoriyalar', $stats['cats'])
                ->icon('heroicon-o-tag')
                ->color('warning'),
        ];
    }
}
