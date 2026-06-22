<?php

namespace App\Http\Controllers;

use App\Services\Analytics\CourseAnalyticsService;
use App\Services\Analytics\ImportedAnalyticsService;
use App\Services\Analytics\InstituteAnalyticsService;
use App\Services\Analytics\StudentAnalyticsService;
use App\Services\Analytics\SummaryAnalyticsService;
use App\Services\Analytics\UserActivityAnalyticsService;
use App\Support\InstitutionNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DashboardAnalyticsController extends Controller
{
    public function __construct(
        private readonly SummaryAnalyticsService $summaryAnalytics,
        private readonly StudentAnalyticsService $studentAnalytics,
        private readonly CourseAnalyticsService $courseAnalytics,
        private readonly UserActivityAnalyticsService $userActivityAnalytics,
        private readonly ImportedAnalyticsService $importedAnalytics,
        private readonly InstituteAnalyticsService $instituteAnalytics,
    ) {}

    public function summary(): JsonResponse
    {
        return response()->json($this->summaryAnalytics->summary($this->institutionScope()));
    }

    public function studentsByInstitution(Request $request): JsonResponse
    {
        $filters = $this->analyticsFilters($request);

        return response()->json(
            $this->studentAnalytics->studentsByInstitution($filters)
        );
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

    public function studentAvatar(int $student): BinaryFileResponse|JsonResponse
    {
        $avatar = $this->studentAnalytics->studentAvatar($student, $this->institutionScope());

        if (! $avatar) {
            return response()->json([
                'message' => 'Student avatar not found.',
            ], 404);
        }

        return response()->file($avatar['path'], [
            'Content-Type' => $avatar['mimeType'],
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

    public function studentsByDepartment(Request $request): JsonResponse
    {
        $filters = $this->analyticsFilters($request);

        return response()->json(
            $this->studentAnalytics->studentsByDepartment($filters)
        );
    }

    public function studentsByCity(Request $request): JsonResponse
    {
        $filters = $this->analyticsFilters($request);

        return response()->json(
            $this->studentAnalytics->studentsByCity($filters)
        );
    }

    public function studentGender(Request $request): JsonResponse
    {
        $filters = $this->analyticsFilters($request);

        return response()->json(
            $this->studentAnalytics->studentGender($filters)
        );
    }

    public function studentActivity(Request $request): JsonResponse
    {
        $filters = $this->analyticsFilters($request);

        return response()->json(
            $this->studentAnalytics->studentActivity($filters)
        );
    }

    public function studentActivityTrend(Request $request): JsonResponse
    {
        $filters = $this->analyticsFilters($request);
        $validated = $request->validate([
            'period' => ['sometimes', 'string', 'in:week,month,year'],
        ]);

        return response()->json(
            $this->studentAnalytics->studentActivityTrend(
                $filters,
                $validated['period'] ?? 'month',
            )
        );
    }

    public function popularCourses(Request $request): JsonResponse
    {
        $filters = $this->analyticsFilters($request);

        return response()->json(
            $this->courseAnalytics->popularCourses($filters['institution'], $filters['department'])
        );
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

    public function userActivity(Request $request): JsonResponse
    {
        return response()->json(
            $this->userActivityAnalytics->userActivity(
                $this->analyticsFilters($request)
            )
        );
    }

    public function learningActivity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dateFrom' => ['sometimes', 'nullable', 'date'],
            'dateTo' => ['sometimes', 'nullable', 'date', 'after_or_equal:dateFrom'],
            'institution' => ['sometimes', 'nullable', 'string', 'max:255'],
            'department' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'courseId' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'activityType' => ['sometimes', 'nullable', 'string', 'max:80'],
            'userStatus' => ['sometimes', 'nullable', 'string', 'in:Active,Inactive,active,inactive'],
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'section' => ['sometimes', 'nullable', 'string', 'in:overview,institutes,departments,courses,students,events,all'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'perPage' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        return response()->json(
            $this->userActivityAnalytics->learningActivity(
                [
                    ...$validated,
                    'institution' => $this->institutionScope()
                        ?? ($validated['institution'] ?? null),
                ],
            ),
        );
    }

    public function importedOverview(): JsonResponse
    {
        return response()->json($this->importedAnalytics->overview());
    }

    public function institutes(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'institution' => ['sometimes', 'nullable', 'string', 'max:255'],
            'department' => ['sometimes', 'nullable', 'string', 'max:255'],
            'dateFrom' => ['sometimes', 'nullable', 'date'],
            'dateTo' => ['sometimes', 'nullable', 'date', 'after_or_equal:dateFrom'],
        ]);
        $institutionScope = $this->institutionScope();
        $requestedInstitution = trim((string) ($validated['institution'] ?? ''));
        $requestedDepartment = trim((string) ($validated['department'] ?? ''));

        return response()->json($this->instituteAnalytics->overview([
            'institution' => $institutionScope
                ?? ($requestedInstitution !== '' ? $requestedInstitution : null),
            'department' => $requestedDepartment !== ''
                ? $requestedDepartment
                : null,
            'dateFrom' => $validated['dateFrom'] ?? null,
            'dateTo' => $validated['dateTo'] ?? null,
        ]));
    }

    private function institutionScope(): ?string
    {
        $user = request()->user();

        if ($user?->role !== 'partner') {
            return null;
        }

        return InstitutionNormalizer::partnerScope($user->institution_name);
    }

    /**
     * @return array{search: ?string, institution: ?string, department: ?string, city: ?string, gender: ?string, status: ?string}
     */
    private function analyticsFilters(Request $request): array
    {
        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'institution' => ['sometimes', 'nullable', 'string', 'max:255'],
            'department' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'gender' => ['sometimes', 'nullable', 'string', 'in:Male,Female,Not filled'],
            'status' => ['sometimes', 'nullable', 'string', 'in:Active,Inactive,active,inactive'],
        ]);
        $institutionScope = $this->institutionScope();
        $requestedSearch = trim((string) ($validated['search'] ?? ''));
        $requestedInstitution = trim((string) ($validated['institution'] ?? ''));
        $requestedDepartment = trim((string) ($validated['department'] ?? ''));
        $requestedCity = trim((string) ($validated['city'] ?? ''));
        $requestedGender = trim((string) ($validated['gender'] ?? ''));
        $requestedStatus = trim((string) ($validated['status'] ?? ''));

        return [
            'search' => $requestedSearch !== '' ? $requestedSearch : null,
            'institution' => $institutionScope ?? ($requestedInstitution !== '' ? $requestedInstitution : null),
            'department' => $requestedDepartment !== '' ? $requestedDepartment : null,
            'city' => $requestedCity !== '' ? $requestedCity : null,
            'gender' => $requestedGender !== '' ? $requestedGender : null,
            'status' => $requestedStatus !== '' ? $requestedStatus : null,
        ];
    }
}
