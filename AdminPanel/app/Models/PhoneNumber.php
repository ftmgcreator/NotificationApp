<?php

namespace App\Models;

use App\Filament\Widgets\PhoneNumberStatsWidget;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PhoneNumber extends Model
{
    protected $fillable = [
        'phone_number',
        'category_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        $flush = fn () => Cache::forget(PhoneNumberStatsWidget::CACHE_KEY);

        static::created($flush);
        static::deleted($flush);
        static::updated(function ($model) use ($flush) {
            if ($model->wasChanged('is_active')) {
                $flush();
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
