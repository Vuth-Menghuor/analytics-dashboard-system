<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\InstitutionNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List Laravel application users only.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'role' => ['sometimes', 'nullable', 'string', Rule::in(['manager', 'partner', 'visitor'])],
            'status' => ['sometimes', 'nullable', 'string', Rule::in(['active', 'inactive', 'Active', 'Inactive'])],
            'institution' => ['sometimes', 'nullable', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'perPage' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $users = User::query()
            ->when($validated['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($validated['role'] ?? null, fn ($query, string $role) => $query->where('role', $role))
            ->when($validated['institution'] ?? null, function ($query, string $institution): void {
                $query->where('institution_name', InstitutionNormalizer::normalize($institution));
            })
            ->when($validated['status'] ?? null, function ($query, string $status): void {
                if (strtolower($status) === 'active') {
                    $query->whereNotNull('email_verified_at');

                    return;
                }

                $query->whereNull('email_verified_at');
            })
            ->latest('id')
            ->paginate((int) ($validated['perPage'] ?? 10));

        $users->through(fn (User $user) => $this->serializeUser($user));

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'role' => ['required', 'string', Rule::in(['manager', 'partner', 'visitor'])],
            'institution_name' => ['nullable', 'required_if:role,partner', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        $validated['institution_name'] = $validated['role'] === 'partner'
            ? InstitutionNormalizer::normalize($validated['institution_name'] ?? null)
            : null;

        $user = User::create([
            ...$validated,
            'email_verified_at' => now(),
        ]);

        return response()->json($this->serializeUser($user), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'string', Rule::in(['manager', 'partner', 'visitor'])],
            'institution_name' => ['nullable', 'required_if:role,partner', 'string', 'max:255'],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
        ]);
        $validated['institution_name'] = $validated['role'] === 'partner'
            ? InstitutionNormalizer::normalize($validated['institution_name'] ?? null)
            : null;

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($this->serializeUser($user->refresh()));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()?->is($user)) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $user->delete();

        return response()->json(status: 204);
    }

    public function updatePassword(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update($validated);

        return response()->json($this->serializeUser($user->refresh()));
    }

    /**
     * @return array{id: int, name: string, email: string, role: string, institution_name: ?string, status: string, email_verified_at: ?string, created_at: ?string, updated_at: ?string}
     */
    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'institution_name' => $user->institution_name,
            'status' => $user->email_verified_at ? 'Active' : 'Inactive',
            'email_verified_at' => $user->email_verified_at?->toISOString(),
            'created_at' => $user->created_at?->toISOString(),
            'updated_at' => $user->updated_at?->toISOString(),
        ];
    }
}
