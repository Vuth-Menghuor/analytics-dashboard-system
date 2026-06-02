<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\PartnerRequestController as BasePartnerRequestController;
use App\Models\PartnerRequest;
use App\Models\User;
use App\Support\InstitutionNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PartnerRequestController extends BasePartnerRequestController
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => [
                'sometimes',
                'nullable',
                'string',
                Rule::in([
                    PartnerRequest::STATUS_PENDING,
                    PartnerRequest::STATUS_APPROVED,
                    PartnerRequest::STATUS_REJECTED,
                ]),
            ],
            'page' => ['sometimes', 'integer', 'min:1'],
            'perPage' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $partnerRequests = PartnerRequest::query()
            ->when($validated['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('institution_name', 'like', "%{$search}%");
                });
            })
            ->when($validated['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->latest('id')
            ->paginate((int) ($validated['perPage'] ?? 10));

        $partnerRequests->through(fn (PartnerRequest $partnerRequest) => $this->serializePartnerRequest($partnerRequest));

        return response()->json($partnerRequests);
    }

    public function approve(Request $request, PartnerRequest $partnerRequest): JsonResponse
    {
        $this->ensurePending($partnerRequest);

        if (User::query()->where('email', $partnerRequest->email)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['A system user already exists for this email.'],
            ]);
        }

        $approvedRequest = DB::transaction(function () use ($request, $partnerRequest): PartnerRequest {
            User::create([
                'name' => $partnerRequest->fullName(),
                'email' => $partnerRequest->email,
                'password' => $partnerRequest->password,
                'role' => 'partner',
                'institution_name' => InstitutionNormalizer::normalize($partnerRequest->institution_name),
                'email_verified_at' => now(),
            ]);

            $partnerRequest->update([
                'status' => PartnerRequest::STATUS_APPROVED,
                'reviewed_by' => $request->user()?->id,
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);

            return $partnerRequest->refresh();
        });

        return response()->json($this->serializePartnerRequest($approvedRequest));
    }

    public function reject(Request $request, PartnerRequest $partnerRequest): JsonResponse
    {
        $this->ensurePending($partnerRequest);

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $partnerRequest->update([
            'status' => PartnerRequest::STATUS_REJECTED,
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'rejection_reason' => $validated['reason'] ?? null,
        ]);

        return response()->json($this->serializePartnerRequest($partnerRequest->refresh()));
    }
}
