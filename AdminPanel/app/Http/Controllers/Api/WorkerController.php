<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\Sms;
use App\Models\Work;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WorkerController extends Controller
{
    public function current(): JsonResponse
    {
        $work = Work::whereHas('smsList', fn ($q) => $q->where('status', 'pending'))
            ->orWhereHas('calls', fn ($q) => $q->where('status', 'pending'))
            ->latest()
            ->first();

        if (! $work) {
            return response()->json(['work' => null]);
        }

        $total   = $work->type === 'sms'
            ? $work->smsList()->count()
            : $work->calls()->count();

        $pending = $work->type === 'sms'
            ? $work->smsList()->where('status', 'pending')->count()
            : $work->calls()->where('status', 'pending')->count();

        return response()->json([
            'work' => [
                'id'           => $work->id,
                'title'        => $work->title,
                'type'         => $work->type,
                'message'      => $work->message,
                'audio_url'    => $work->audio_file
                    ? url('api/worker/audio/' . $work->id)
                    : null,
                'scheduled_at' => $work->scheduled_at?->toIso8601String(),
            ],
            'stats' => [
                'total'   => $total,
                'pending' => $pending,
                'done'    => $total - $pending,
            ],
        ]);
    }

    public function numbers(int $workId, Request $request): JsonResponse
    {
        $limit  = min((int) $request->query('limit', 30), 100);
        $offset = (int) $request->query('offset', 0);

        $work = Work::findOrFail($workId);

        if ($work->type === 'sms') {
            $items = Sms::with('phoneNumber')
                ->where('work_id', $workId)
                ->where('status', 'pending')
                ->offset($offset)
                ->limit($limit)
                ->get()
                ->map(fn ($s) => [
                    'sms_id'       => $s->id,
                    'phone_number' => $s->phoneNumber?->phone_number,
                ]);

            $total = Sms::where('work_id', $workId)->where('status', 'pending')->count();
        } else {
            $items = Call::with('phoneNumber')
                ->where('work_id', $workId)
                ->where('status', 'pending')
                ->offset($offset)
                ->limit($limit)
                ->get()
                ->map(fn ($c) => [
                    'call_id'      => $c->id,
                    'phone_number' => $c->phoneNumber?->phone_number,
                ]);

            $total = Call::where('work_id', $workId)->where('status', 'pending')->count();
        }

        return response()->json([
            'items'    => $items,
            'total'    => $total,
            'has_more' => ($offset + $limit) < $total,
        ]);
    }

    public function updateSms(int $smsId, Request $request): JsonResponse
    {
        $request->validate(['status' => 'required|in:sent,failed']);

        $sms = Sms::findOrFail($smsId);
        $sms->update(['status' => $request->status]);

        return response()->json(['success' => true, 'status' => $sms->status]);
    }

    public function updateCall(int $callId, Request $request): JsonResponse
    {
        $request->validate(['status' => 'required|in:called,failed,no_answer']);

        $call = Call::findOrFail($callId);
        $call->update(['status' => $request->status]);

        return response()->json(['success' => true, 'status' => $call->status]);
    }

    public function audio(int $workId): StreamedResponse
    {
        $work = Work::findOrFail($workId);

        abort_if(! $work->audio_file, 404);

        return Storage::download($work->audio_file);
    }
}
