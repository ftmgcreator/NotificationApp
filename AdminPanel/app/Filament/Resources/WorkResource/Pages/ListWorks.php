<?php

namespace App\Filament\Resources\WorkResource\Pages;

use App\Filament\Resources\WorkResource;
use App\Filament\Widgets\WorksByDateChart;
use App\Filament\Widgets\WorkTypeChart;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListWorks extends ListRecords
{
    protected static string $resource = WorkResource::class;

    protected function getHeaderWidgets(): array
    {
        return [
            WorkTypeChart::class,
            WorksByDateChart::class,
        ];
    }

    public function getHeaderWidgetsColumns(): int|array
    {
        return 3;
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Yangi Ishni yaratish'),
        ];
    }
}
