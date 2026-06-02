<?php

namespace App\Http\Controllers;

use App\Models\PartnerRequest;
use App\Models\User;
use App\Support\InstitutionNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        ]);

        $idCardPath = $request->file('id_card')?->store('partner-requests', 'public');
        $validated['institution_name'] = InstitutionNormalizer::normalize($validated['institution_name']);

        $partnerRequest = PartnerRequest::create([
            ...$validated,
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
}
