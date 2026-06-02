<?php

namespace App\Http\Controllers;

use App\Services\Analytics\CourseAnalyticsService;
use App\Services\Analytics\ImportedAnalyticsService;
use App\Services\Analytics\StudentAnalyticsService;
use App\Services\Analytics\SummaryAnalyticsService;
use App\Services\Analytics\UserActivityAnalyticsService;
use App\Support\InstitutionNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardAnalyticsController extends Controller
{
    public function __construct(
        private readonly SummaryAnalyticsService $summaryAnalytics,
        private readonly StudentAnalyticsService $studentAnalytics,
        private readonly CourseAnalyticsService $courseAnalytics,
        private readonly UserActivityAnalyticsService $userActivityAnalytics,
        private readonly ImportedAnalyticsService $importedAnalytics,
    ) {}

    public function summary(): JsonResponse
    {
        return response()->json($this->summaryAnalytics->summary($this->institutionScope()));
    }

    public function studentsByInstitution(): JsonResponse
    {
        return response()->json($this->studentAnalytics->studentsByInstitution($this->institutionScope()));
    }

    public function students(Request $request): JsonResponse
    {
        $students = $this->studentAnalytics->students($request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'perPage' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'institution' => ['sometimes', 'nullable', 'string', 'max:255'],
            'department' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'gender' => ['sometimes', 'nullable', 'string', 'in:Male,Female,Not filled'],
            'status' => ['sometimes', 'nullable', 'string', 'in:Active,Inactive,active,inactive'],
        ]), $this->institutionScope());

        return response()->json([
            'data' => $students->items(),
            'meta' => [
                'currentPage' => $students->currentPage(),
                'perPage' => $students->perPage(),
                'total' => $students->total(),
                'lastPage' => $students->lastPage(),
            ],
        ]);
    }

    public function student(int $student): JsonResponse
    {
        $record = $this->studentAnalytics->student($student, $this->institutionScope());

        if (! $record) {
            return response()->json([
                'message' => 'Student not found.',
            ], 404);
        }

        return response()->json($record);
    }

    public function studentsByDepartment(): JsonResponse
    {
        return response()->json($this->studentAnalytics->studentsByDepartment($this->institutionScope()));
    }

    public function studentsByCity(): JsonResponse
    {
        return response()->json($this->studentAnalytics->studentsByCity($this->institutionScope()));
    }

    public function studentGender(): JsonResponse
    {
        return response()->json($this->studentAnalytics->studentGender($this->institutionScope()));
    }

    public function studentActivity(): JsonResponse
    {
        return response()->json(
            $this->studentAnalytics->studentActivity($this->institutionScope())
        );
    }

    public function popularCourses(): JsonResponse
    {
        return response()->json($this->courseAnalytics->popularCourses($this->institutionScope()));
    }

    public function courses(): JsonResponse
    {
        return response()->json($this->courseAnalytics->courses($this->institutionScope()));
    }

    public function courseCompletion(): JsonResponse
    {
        return response()->json($this->courseAnalytics->courseCompletion($this->institutionScope()));
    }

    public function courseViews(): JsonResponse
    {
        return response()->json($this->courseAnalytics->courseViews($this->institutionScope()));
    }

    public function userActivity(): JsonResponse
    {
        return response()->json($this->userActivityAnalytics->userActivity($this->institutionScope()));
    }

    public function importedOverview(): JsonResponse
    {
        return response()->json($this->importedAnalytics->overview());
    }

    private function institutionScope(): ?string
    {
        $user = request()->user();

        if ($user?->role !== 'partner') {
            return null;
        }

        return InstitutionNormalizer::partnerScope($user->institution_name);
    }
}
