<?php

namespace App\Filament\Resources\PhoneNumberResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class SmsListRelationManager extends RelationManager
{
    protected static string $relationship = 'smsList';

    protected static ?string $title = 'SMS xabarlar';

    protected static ?string $modelLabel = 'SMS';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                Tables\Columns\TextColumn::make('work.title')
                    ->label('Ish')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('work.message')
                    ->label('Xabar matni')
                    ->limit(50)
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('status')
                    ->label('Holat')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'created' => 'Yaratilgan',
                        'pending' => 'Jarayonda',
                        'sent'    => 'Yuborildi',
                        'failed'  => 'Xatolik',
                        default   => $state,
                    })
                    ->color(fn ($state) => match ($state) {
                        'sent'    => 'success',
                        'failed'  => 'danger',
                        'pending' => 'info',
                        default   => 'warning',
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
                        'created' => 'Yaratilgan',
                        'pending' => 'Jarayonda',
                        'sent'    => 'Yuborildi',
                        'failed'  => 'Xatolik',
                    ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->headerActions([])
            ->actions([])
            ->bulkActions([]);
    }
}
