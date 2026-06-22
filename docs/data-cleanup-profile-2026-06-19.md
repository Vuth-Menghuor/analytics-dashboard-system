# Data Cleanup Profile

Date: 2026-06-19  
Database: `projecti5`  
Phase: 2A — read-only profiling

## Scope

This phase profiled gender, institution, department, and city data. It compared current `public.mdl_user` values with the Phase 1 recovery snapshots.

No database rows, views, or schemas were changed during Phase 2A.

## Dashboard student population

The current `vw_moodle_students` logic identifies 17,435 non-deleted users with the Moodle `student` role.

| Field | Filled | Blank / not filled |
|---|---:|---:|
| Gender | 12,635 | 4,800 |
| Institution | 16,607 | 828 |
| Department | 14,094 | 3,341 |
| City | 14,500 | 2,935 |

Current student gender values:

| Value | Students |
|---|---:|
| Male | 8,136 |
| Female | 4,499 |
| Blank | 4,800 |

## Existing cleanup evidence

Across all 22,131 Moodle users:

| Field | Changed users | Distinct original values changed |
|---|---:|---:|
| Gender (`phone1`) | 15,329 | 24 |
| Institution | 551 | 22 |
| Department | 2,243 | 117 |

Within the dashboard student population:

| Field | Changed students |
|---|---:|
| Gender | 11,470 |
| Institution | 415 |
| Department | 1,971 |

No original gender, institution, or department value maps to more than one current cleaned value. The observed transformations are deterministic and can therefore be represented by mapping tables.

## Gender findings

The original `phone1` field was used as a gender source. Common original values included:

- `M` → `Male` for 9,685 users
- `F` → `Female` for 5,311 users
- `Femal` → `Female`
- `male` and `MALE` → `Male`
- Khmer `ប្រុស` → `Male`
- Invalid placeholders, phone numbers, `N`, `B`, and `b` → blank

Current gender values are fully standardized to `Male`, `Female`, or blank.

Recommended clean-layer rule:

1. Map recognized male values to `Male`.
2. Map recognized female values to `Female`.
3. Return `NULL` for blank, placeholder, phone-number, or unknown values.
4. Let the API/UI display `NULL` as `Not filled`.

The raw `phone1` value must remain unchanged after restoration.

## Institution findings

Current data has 17 nonblank institution codes, with no case or outer-whitespace duplicates.

Important observed mappings include:

| Original | Cleaned |
|---|---|
| `SR` | `SRU` |
| `TEST` | blank |
| `RUA-F3VMA`, `RUA-F3VMB`, `RUA-F3VMC`, `RUA-F3VMD`, `RUA-F3VME`, `RUA-VM2A` | `RUA` |
| `IFL,RUPP` | `RUPP` |
| `ITC-KP`, `ITC-TK`, `ITC-KIRIROM`, `TBK` | `ITC` |
| `AU` | `AUB` |
| `Curtin`, `IIT`, `CIRAD`, `ERA`, `Institute of Tropical Medicine`, `KSIT`, `ITG`, `Hong Kong` | blank |

Recommended implementation: an `analytics_clean.institution_mapping` table containing original and canonical values. Unmapped nonblank values should pass through after trimming, while mapped invalid values should become `NULL`.

## Department findings

Current data has 62 nonblank department values, with no case or outer-whitespace duplicates.

Examples of observed normalization:

| Pattern or original | Cleaned |
|---|---|
| `CS`, `cs`, `Cs`, `computer science`, spelling variants | `Computer Science` |
| `GEE_EA`, `GEE_EE`, `GEE-EA`, `GEE-EE` | `GEE` |
| `GIM_Mé`, `GIM-MeE`, `GIM_Ind`, `GIM-InE` | `GIM` |
| `GCI-Arch`, `GCI_Arch`, `GCI-TBK`, `GCITBK` | `GCI` |
| `GS-ETM`, `GS-MSE`, `GS-DAS`, `GS-MIC`, other `GS-*` variants | `GS` |
| `InterProgram-SE`, `InterProgram-AIEC`, other approved variants | `InterProgram` |
| `RUA-AI02`, `RUA-AI03`, and similar numbered variants | `RUA-AI` |
| `NUBBYear*` | `NUBB` |
| `PAD`, `Foundation Year`, `_M`, `ChE`, `Ind`, `ENG` | blank |

Because 117 distinct original values were changed, these rules should not be embedded as a large Laravel or SQL `CASE` expression. Use an auditable `analytics_clean.department_mapping` table.

No ambiguous original-to-cleaned department mappings were found, so the original department value can be the mapping key.

## City findings

Current city data has:

- 19 nonblank values
- no outer-whitespace variants
- no case-only duplicates

Largest student values:

| City | Students |
|---|---:|
| Phnom Penh | 11,642 |
| Svay Rieng | 2,310 |
| Ta Khmau | 477 |
| Blank | 2,935 |

There is no dedicated pre-cleanup city backup. The available Phase 1 `mdl_user` snapshot contains the already-current city values. We therefore cannot prove from the live database alone whether city was previously modified.

Recommended rule for now: trim city and convert blank strings to `NULL`, but do not rename cities until an untouched source is compared.

## Proposed clean-layer objects

Phase 2B should create:

- `analytics_clean.gender_mapping`
- `analytics_clean.institution_mapping`
- `analytics_clean.department_mapping`
- `analytics_clean.students`
- `analytics_clean.teachers`
- `analytics_clean.courses`
- `analytics_clean.enrollments`
- `analytics_clean.user_activity`

The mapping tables should be generated from the observed recovery-snapshot-to-current transformations and reviewed before use.

The clean student view should:

1. Read raw Moodle user and role tables.
2. Preserve raw values in explicitly named columns when useful.
3. Apply mapping tables to produce canonical gender, institution, and department.
4. Normalize empty text to `NULL`.
5. Exclude deleted users and select only the intended Moodle role.

## Required decision before Phase 2B

The following policy needs confirmation:

- Should invalid or out-of-scope institutions/departments become `NULL`, as the current cleanup does?
- Or should the clean layer preserve them under labels such as `Other` or their original value?

The current dashboard behavior uses blank / `Not filled`. Reproducing that behavior is the lowest-risk initial implementation.

