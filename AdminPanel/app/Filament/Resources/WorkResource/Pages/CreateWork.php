<?php

namespace App\Filament\Resources\WorkResource\Pages;

use App\Filament\Resources\WorkResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateWork extends CreateRecord
{
    protected static string $resource = WorkResource::class;

    protected static string $view = 'filament.resources.work-resource.pages.create-work';

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
