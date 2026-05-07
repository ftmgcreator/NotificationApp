<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\Sms;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $smsSent    = Sms::whereDate('created_at', today())->where('status', 'sent')->count();
        $callsMade  = Call::whereDate('created_at', today())->where('status', 'called')->count();
        $smsFailed  = Sms::whereDate('created_at', today())->where('status', 'failed')->count();
        $callFailed = Call::whereDate('created_at', today())->where('status', 'failed')->count();
        $smsPending = Sms::where('status', 'pending')->count();
        $retries    = Sms::where('status', 'failed')->count() + Call::where('status', 'failed')->count();

        $smsActivity = Sms::with('phoneNumber')
            ->whereDate('created_at', today())
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'type'       => 'sms',
                'number'     => $s->phoneNumber?->phone_number,
                'status'     => $s->status,
                'created_at' => $s->created_at?->format('H:i'),
            ]);

        $callActivity = Call::with('phoneNumber')
            ->whereDate('created_at', today())
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($c) => [
                'type'       => 'call',
                'number'     => $c->phoneNumber?->phone_number,
                'status'     => $c->status,
                'created_at' => $c->created_at?->format('H:i'),
            ]);

        $activity = $smsActivity->concat($callActivity)
            ->sortByDesc('created_at')
            ->values()
            ->take(15);

        return response()->json([
            'today' => [
                'sms_sent'   => $smsSent,
                'calls_made' => $callsMade,
                'failed'     => $smsFailed + $callFailed,
                'pending'    => $smsPending,
                'retries'    => $retries,
            ],
            'activity' => $activity,
        ]);
    }
}
