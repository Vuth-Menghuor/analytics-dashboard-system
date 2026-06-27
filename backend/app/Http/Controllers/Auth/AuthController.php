<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:visitor'],
            'google_id_token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $googleAccount = $this->verifiedGoogleAccount($validated['google_id_token']);
        $email = strtolower((string) $googleAccount['email']);
        $existingUser = User::query()->where('email', $email)->first();

        if ($existingUser) {
            throw ValidationException::withMessages([
                'email' => ['An account already exists for this email.'],
            ]);
        }

        $user = User::create([
            'name' => $this->googleDisplayName($googleAccount),
            'email' => $email,
            'password' => $validated['password'],
            'role' => 'visitor',
            'institution_name' => null,
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('dashboard-login', [$user->role])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->serializeUser($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('email', $credentials['email'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('dashboard-login', [$user->role])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->serializeUser($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * @return array{id: int, name: string, email: string, role: string, institution_name: ?string}
     */
    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'institution_name' => $user->institution_name,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function verifiedGoogleAccount(string $idToken): array
    {
        $clientId = config('services.google.client_id');

        if (! is_string($clientId) || trim($clientId) === '') {
            throw ValidationException::withMessages([
                'email' => ['Google account verification is not configured.'],
            ]);
        }

        $response = Http::timeout(5)->get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $idToken,
        ]);

        if (! $response->ok()) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email with a valid Google account.'],
            ]);
        }

        $googleAccount = $response->json();
        $googleEmail = strtolower((string) ($googleAccount['email'] ?? ''));
        $isVerified = filter_var($googleAccount['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $audience = (string) ($googleAccount['aud'] ?? '');

        if ($audience !== $clientId || ! $isVerified || $googleEmail === '') {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email with a valid Google account.'],
            ]);
        }

        return $googleAccount;
    }

    /**
     * @param array<string, mixed> $googleAccount
     */
    private function googleDisplayName(array $googleAccount): string
    {
        $name = trim((string) ($googleAccount['name'] ?? ''));

        if ($name !== '') {
            return $name;
        }

        $givenName = trim((string) ($googleAccount['given_name'] ?? ''));
        $familyName = trim((string) ($googleAccount['family_name'] ?? ''));
        $fullName = trim("{$givenName} {$familyName}");

        return $fullName !== '' ? $fullName : (string) $googleAccount['email'];
    }
}
