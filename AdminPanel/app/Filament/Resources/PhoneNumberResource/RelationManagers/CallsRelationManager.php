<?php

namespace App\Filament\Resources\PhoneNumberResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class CallsRelationManager extends RelationManager
{
    protected static string $relationship = 'calls';

    protected static ?string $title = 'Qo\'ng\'iroqlar';

    protected static ?string $modelLabel = 'Qo\'ng\'iroq';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                Tables\Columns\TextColumn::make('work.title')
                    ->label('Ish')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Holat')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'created'   => 'Yaratilgan',
                        'pending'   => 'Jarayonda',
                        'called'    => 'Qo\'ng\'iroq qilindi',
                        'failed'    => 'Xatolik',
                        'no_answer' => 'Ko\'tarilmadi',
                        default     => $state,
                    })
                    ->color(fn ($state) => match ($state) {
                        'called'    => 'success',
                        'failed'    => 'danger',
                        'no_answer' => 'gray',
                        'pending'   => 'info',
                        default     => 'warning',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Vaqti')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Holat')
                    ->options([
                        'created'   => 'Yaratilgan',
                        'pending'   => 'Jarayonda',
                        'called'    => 'Qo\'ng\'iroq qilindi',
                        'no_answer' => 'Ko\'tarilmadi',
                        'failed'    => 'Xatolik',
                    ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->headerActions([])
            ->actions([])
            ->bulkActions([]);
    }
}
