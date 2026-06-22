<?php

use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\PartnerRequestController as AdminPartnerRequestController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardAnalyticsController;
use App\Http\Controllers\PartnerRequestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/partner-requests', [PartnerRequestController::class, 'store']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user()->only(['id', 'name', 'email', 'role', 'institution_name']);
    });

    Route::get('/analytics/imported/overview', [DashboardAnalyticsController::class, 'importedOverview'])
    ->middleware('role:manager,partner');

    Route::middleware('role:manager')->prefix('admin')->group(function (): void {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::put('/users/{user}', [AdminUserController::class, 'update']);
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
        Route::patch('/users/{user}/password', [AdminUserController::class, 'updatePassword']);
        Route::get('/partner-requests', [AdminPartnerRequestController::class, 'index']);
        Route::patch('/partner-requests/{partnerRequest}/approve', [AdminPartnerRequestController::class, 'approve']);
        Route::patch('/partner-requests/{partnerRequest}/reject', [AdminPartnerRequestController::class, 'reject']);
    });

    Route::middleware('role:manager,partner,visitor')->prefix('dashboard')->group(function (): void {
        Route::get('/summary', [DashboardAnalyticsController::class, 'summary']);
        Route::get('/institutes', [DashboardAnalyticsController::class, 'institutes']);

        Route::get('/students', [DashboardAnalyticsController::class, 'students']);
        Route::get('/students/by-institution', [DashboardAnalyticsController::class, 'studentsByInstitution']);
        Route::get('/students/by-department', [DashboardAnalyticsController::class, 'studentsByDepartment']);
        Route::get('/students/by-city', [DashboardAnalyticsController::class, 'studentsByCity']);
        Route::get('/students/gender', [DashboardAnalyticsController::class, 'studentGender']);
        Route::get('/students/{student}/avatar', [DashboardAnalyticsController::class, 'studentAvatar'])->whereNumber('student');
        Route::get('/students/{student}', [DashboardAnalyticsController::class, 'student'])->whereNumber('student');
        Route::get('/students/activity', [DashboardAnalyticsController::class, 'studentActivity']);
        Route::get('/students/activity-trend', [DashboardAnalyticsController::class, 'studentActivityTrend']);

        Route::get('/courses', [DashboardAnalyticsController::class, 'courses']);
        Route::get('/courses/popular', [DashboardAnalyticsController::class, 'popularCourses']);
        Route::get('/courses/completion', [DashboardAnalyticsController::class, 'courseCompletion']);
        Route::get('/courses/views', [DashboardAnalyticsController::class, 'courseViews']);

        Route::get('/users/activity', [DashboardAnalyticsController::class, 'userActivity']);
        Route::get('/learning-activity', [DashboardAnalyticsController::class, 'learningActivity']);
    });
});
