<?php

namespace App\Jobs;

use App\Models\Call;
use App\Models\PhoneNumber;
use App\Models\Sms;
use App\Models\Work;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessWorkJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Work $work) {}

    public function handle(): void
    {
        $phoneNumbers = PhoneNumber::where('category_id', $this->work->category_id)
            ->where('is_active', true)
            ->get();

        if ($this->work->type === 'sms') {
            $records = $phoneNumbers->map(fn ($phone) => [
                'work_id'         => $this->work->id,
                'phone_number_id' => $phone->id,
                'status'          => 'created',
                'created_at'      => now(),
                'updated_at'      => now(),
            ])->toArray();

            Sms::insert($records);
        } else {
            $records = $phoneNumbers->map(fn ($phone) => [
                'work_id'         => $this->work->id,
                'phone_number_id' => $phone->id,
                'status'          => 'created',
                'created_at'      => now(),
                'updated_at'      => now(),
            ])->toArray();

            Call::insert($records);
        }
    }
}
