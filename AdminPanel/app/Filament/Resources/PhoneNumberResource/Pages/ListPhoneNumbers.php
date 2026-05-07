<?php

namespace App\Filament\Resources\PhoneNumberResource\Pages;

use App\Exports\PhoneNumberExport;
use App\Exports\PhoneNumberTemplateExport;
use App\Filament\Resources\PhoneNumberResource;
use App\Filament\Widgets\PhoneNumberStatsWidget;
use App\Imports\PhoneNumberImport;
use Illuminate\Support\Facades\Cache;
use Filament\Actions;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Forms\Components\FileUpload;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Maatwebsite\Excel\Facades\Excel;

class ListPhoneNumbers extends ListRecords
{
    protected static string $resource = PhoneNumberResource::class;

    protected function getHeaderWidgets(): array
    {
        return [
            PhoneNumberStatsWidget::class,
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->icon('heroicon-o-plus')
                ->iconButton()
                ->extraAttributes(['style' => 'background-color:#EAB308 !important; color:#000 !important;']),

            ActionGroup::make([
                Action::make('export')
                    ->label('Export')
                    ->icon('heroicon-o-arrow-up-tray')
                    ->action(function () {
                        return Excel::download(new PhoneNumberExport, 'telefon-raqamlar.xlsx');
                    }),

                Action::make('import')
                    ->label('Import')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->form([
                        FileUpload::make('file')
                            ->label('Excel fayl')
                            ->acceptedFileTypes([
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                'application/vnd.ms-excel',
                            ])
                            ->required(),
                    ])
                    ->action(function (array $data) {
                        Excel::import(
                            new PhoneNumberImport,
                            storage_path('app/public/' . $data['file'])
                        );

                        Cache::forget(PhoneNumberStatsWidget::CACHE_KEY);

                        Notification::make()
                            ->title('Import muvaffaqiyatli bajarildi')
                            ->success()
                            ->send();
                    }),

                Action::make('template')
                    ->label('Shablon yuklab olish')
                    ->icon('heroicon-o-document-arrow-down')
                    ->action(fn () => Excel::download(new PhoneNumberTemplateExport, 'shablon.xlsx')),
            ])
                ->label('Excel')
                ->icon('heroicon-o-table-cells')
                ->button()
                ->extraAttributes(['style' => 'background-color:#16A34A !important; color:#fff !important;']),
        ];
    }
}
