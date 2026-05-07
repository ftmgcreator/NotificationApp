<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\WorkerController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',     [AuthController::class, 'me']);

    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::prefix('worker')->group(function () {
        Route::get('current',              [WorkerController::class, 'current']);
        Route::get('{workId}/numbers',     [WorkerController::class, 'numbers']);
        Route::patch('sms/{smsId}',        [WorkerController::class, 'updateSms']);
        Route::patch('calls/{callId}',     [WorkerController::class, 'updateCall']);
        Route::get('audio/{workId}',       [WorkerController::class, 'audio']);
    });
});
