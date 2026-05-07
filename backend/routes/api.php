<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user()->only(['id', 'name', 'email', 'role']);
    });

    Route::get('/manager/dashboard', function () {
        return response()->json([
            'message' => 'Manager dashboard',
        ]);
    })->middleware('role:manager');

    Route::get('/partner/dashboard', function () {
        return response()->json([
            'message' => 'Partner dashboard',
        ]);
    })->middleware('role:partner');

    Route::get('/visitor/dashboard', function () {
        return response()->json([
            'message' => 'Visitor dashboard',
        ]);
    })->middleware('role:visitor');
});
