<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Call extends Model
{
    protected $fillable = ['work_id', 'phone_number_id', 'status'];

    public function work()
    {
        return $this->belongsTo(Work::class);
    }

    public function phoneNumber()
    {
        return $this->belongsTo(PhoneNumber::class);
    }
}
