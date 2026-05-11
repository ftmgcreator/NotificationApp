<?php

namespace App\Filament\Resources\WorkResource\RelationManagers;

use App\Models\Work;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class CallsRelationManager extends RelationManager
{
    protected static string $relationship = 'calls';

    protected static ?string $title = 'Qo\'ng\'iroqlar';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return $ownerRecord instanceof Work && $ownerRecord->type === 'call';
    }

    public function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                Tables\Columns\TextColumn::make('phoneNumber.phone_number')
                    ->label('Telefon raqam')
                    ->searchable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Holat')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'created' => 'Yaratilgan',
                        'called'  => 'Qo\'ng\'irildi',
                        'failed'  => 'Xatolik',
                        default   => $state,
                    })
                    ->color(fn ($state) => match ($state) {
                        'called'  => 'success',
                        'failed'  => 'danger',
                        'created' => 'warning',
                        default   => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Yaratilgan')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Yangilangan')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Holat')
                    ->options([
                        'created' => 'Yaratilgan',
                        'called'  => 'Qo\'ng\'irildi',
                        'failed'  => 'Xatolik',
                    ]),
            ])
            ->headerActions([])
            ->actions([])
            ->bulkActions([]);
    }
}
