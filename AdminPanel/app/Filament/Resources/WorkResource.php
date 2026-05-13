<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WorkResource\Pages;
use App\Filament\Resources\WorkResource\RelationManagers;
use App\Models\Category;
use App\Models\Work;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WorkResource extends Resource
{
    protected static ?string $model = Work::class;

    protected static ?string $navigationIcon = 'heroicon-o-briefcase';

    protected static ?string $navigationLabel = 'Ishlar';

    protected static ?string $modelLabel = 'Ish';

    protected static ?string $pluralModelLabel = 'Ishlar';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('title')
                ->label('Sarlavha')
                ->required()
                ->maxLength(255)
                ->columnSpanFull(),

            Forms\Components\ToggleButtons::make('type')
                ->label('Tur')
                ->options(['sms' => 'SMS', 'call' => 'Qo\'ng\'iroq'])
                ->icons(['sms' => 'heroicon-o-chat-bubble-left-right', 'call' => 'heroicon-o-phone'])
                ->colors(['sms' => 'info', 'call' => 'success'])
                ->required()
                ->live()
                ->inline(),

            Forms\Components\Select::make('category_id')
                ->label('Kategoriya')
                ->options(Category::pluck('name', 'id'))
                ->searchable()
                ->required(),

            Forms\Components\DateTimePicker::make('scheduled_at')
                ->label('Rejalashtirish vaqti')
                ->nullable()
                ->columnSpanFull(),

            Forms\Components\Textarea::make('message')
                ->label('Xabar matni')
                ->rows(5)
                ->required()
                ->columnSpanFull()
                ->visible(fn (Get $get) => $get('type') === 'sms'),

            Forms\Components\FileUpload::make('audio_file')
                ->label('Ovozli fayl')
                ->acceptedFileTypes(['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'])
                ->required()
                ->columnSpanFull()
                ->visible(fn (Get $get) => $get('type') === 'call'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Sarlavha')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('type')
                    ->label('Tur')
                    ->badge()
                    ->formatStateUsing(fn ($state) => $state === 'sms' ? 'SMS' : 'Qo\'ng\'iroq')
                    ->color(fn ($state) => $state === 'sms' ? 'info' : 'success'),

                Tables\Columns\TextColumn::make('category.name')
                    ->label('Kategoriya')
                    ->badge(),

                Tables\Columns\TextColumn::make('progress')
                    ->label('Bajarildi')
                    ->badge()
                    ->getStateUsing(function ($record) {
                        $relation = $record->type === 'sms' ? 'smsList' : 'calls';
                        $total    = $record->{$relation}()->count();
                        $done     = $record->{$relation}()
                            ->whereNotIn('status', ['created', 'pending'])
                            ->count();
                        $percent  = $total > 0 ? round($done / $total * 100) : 0;
                        return "{$done}/{$total} ({$percent}%)";
                    })
                    ->color(function ($record) {
                        $relation = $record->type === 'sms' ? 'smsList' : 'calls';
                        $total    = $record->{$relation}()->count();
                        $done     = $record->{$relation}()
                            ->whereNotIn('status', ['created', 'pending'])
                            ->count();
                        if ($total === 0)        return 'gray';
                        if ($done === $total)    return 'success';
                        if ($done === 0)         return 'warning';
                        return 'info';
                    }),

                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Rejalashtirilgan')
                    ->dateTime('d.m.Y H:i')
                    ->placeholder('—')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Yaratilgan')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->trueLabel('Faol')
                    ->falseLabel('Nofaol'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->iconButton(),
                Tables\Actions\DeleteAction::make()->iconButton(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()->label('O\'chirish'),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\SmsListRelationManager::class,
            RelationManagers\CallsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListWorks::route('/'),
            'create' => Pages\CreateWork::route('/create'),
            'edit'   => Pages\EditWork::route('/{record}/edit'),
        ];
    }
}
