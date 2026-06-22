<?php

namespace App\Http\Controllers;

use App\Models\PartnerRequest;
use App\Models\User;
use App\Support\InstitutionNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PartnerRequestController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state_province' => ['required', 'string', 'max:255'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
                Rule::unique('partner_requests', 'email'),
            ],
            'phone_number' => ['required', 'string', 'max:50'],
            'institution_name' => ['required', 'string', 'max:255'],
            'id_card' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'google_id_token' => ['required', 'string'],
        ]);

        $this->ensureGoogleEmailMatches($validated['google_id_token'], $validated['email']);

        $idCardPath = $request->file('id_card')?->store('partner-requests', 'public');
        $validated['institution_name'] = InstitutionNormalizer::normalize($validated['institution_name']);

        $partnerRequest = PartnerRequest::create([
            ...collect($validated)->except('google_id_token')->all(),
            'id_card_path' => $idCardPath,
            'status' => PartnerRequest::STATUS_PENDING,
        ]);

        return response()->json($this->serializePartnerRequest($partnerRequest), 201);
    }

    /**
     * @return array{id: int, state_province: string, first_name: string, last_name: string, name: string, email: string, phone_number: string, institution_name: string, id_card_path: ?string, status: string, reviewed_by: ?int, reviewed_at: ?string, rejection_reason: ?string, created_at: ?string, updated_at: ?string}
     */
    protected function serializePartnerRequest(PartnerRequest $partnerRequest): array
    {
        return [
            'id' => $partnerRequest->id,
            'state_province' => $partnerRequest->state_province,
            'first_name' => $partnerRequest->first_name,
            'last_name' => $partnerRequest->last_name,
            'name' => $partnerRequest->fullName(),
            'email' => $partnerRequest->email,
            'phone_number' => $partnerRequest->phone_number,
            'institution_name' => $partnerRequest->institution_name,
            'id_card_path' => $partnerRequest->id_card_path,
            'status' => $partnerRequest->status,
            'reviewed_by' => $partnerRequest->reviewed_by,
            'reviewed_at' => $partnerRequest->reviewed_at?->toISOString(),
            'rejection_reason' => $partnerRequest->rejection_reason,
            'created_at' => $partnerRequest->created_at?->toISOString(),
            'updated_at' => $partnerRequest->updated_at?->toISOString(),
        ];
    }

    protected function ensurePending(PartnerRequest $partnerRequest): void
    {
        if ($partnerRequest->status !== PartnerRequest::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'status' => ['Only pending partner requests can be reviewed.'],
            ]);
        }
    }

    private function ensureGoogleEmailMatches(string $idToken, string $submittedEmail): void
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

        if ($googleEmail !== strtolower($submittedEmail)) {
            throw ValidationException::withMessages([
                'email' => ['The submitted email must match the verified Google account email.'],
            ]);
        }
    }
}
