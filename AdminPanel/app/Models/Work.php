<?php

namespace App\Models;

use App\Jobs\ProcessWorkJob;
use Illuminate\Database\Eloquent\Model;

class Work extends Model
{
    protected $fillable = [
        'title',
        'type',
        'message',
        'audio_file',
        'category_id',
        'scheduled_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(fn (Work $work) => ProcessWorkJob::dispatchSync($work));
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function smsList()
    {
        return $this->hasMany(Sms::class);
    }

    public function calls()
    {
        return $this->hasMany(Call::class);
    }
}
