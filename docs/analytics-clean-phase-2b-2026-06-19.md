# Clean Analytics Layer — Phase 2B

Date: 2026-06-19  
Database: `projecti5`  
Schema: `analytics_clean`

## Outcome

The clean analytics layer was created successfully without modifying:

- `public.mdl_user`
- any other `public.mdl_*` table
- existing `public.vw_moodle_*` views
- Laravel models or services
- UI behavior

All database object creation ran in one transaction.

## Mapping tables

| Table | Mapping rows | Purpose |
|---|---:|---|
| `analytics_clean.gender_mapping` | 24 | Original `phone1` value to canonical gender |
| `analytics_clean.institution_mapping` | 22 | Original institution value to canonical institution |
| `analytics_clean.department_mapping` | 117 | Original department value to canonical department |

Each mapping table contains:

- `source_value` — exact original value
- `cleaned_value` — canonical value, or `NULL` for invalid/not-filled data
- `affected_users` — number of users affected by the observed transformation
- `captured_at` — mapping creation timestamp

The mappings were derived from the Phase 1 recovery snapshots and current cleaned values. Preflight checks confirmed that no source value maps to multiple cleaned values.

## Clean views

| View | Current rows | Source |
|---|---:|---|
| `analytics_clean.students` | 17,435 | Moodle users and student roles |
| `analytics_clean.teachers` | 712 | Moodle users and teacher roles |
| `analytics_clean.courses` | 1,523 | `public.mdl_course` |
| `analytics_clean.enrollments` | 201,359 | Moodle enrollment tables |
| `analytics_clean.user_activity` | 20,220 | `public.mdl_user` |

The student and teacher views expose canonical fields and retain raw values in:

- `raw_gender`
- `raw_institution`
- `raw_department`
- `raw_city`

City currently receives only safe normalization: outer whitespace is removed and blank text becomes `NULL`.

## Validation

The versioned validation suite compared the new views with the current public dashboard views.

| Validation | Mismatches |
|---|---:|
| Students | 0 |
| Teachers | 0 |
| Courses | 0 |
| Enrollments | 0 |
| User activity | 0 |

A restoration simulation applied the mapping tables to original values from the recovery snapshots:

| Simulated restored field | Mismatches from current cleaned result |
|---|---:|
| Gender | 0 |
| Institution | 0 |
| Department | 0 |

This confirms that the clean layer can reproduce the current cleaned dashboard values after those raw fields are restored.

## Versioned SQL

- Definition: [`backend/database/sql/analytics_clean_phase_2b.sql`](../backend/database/sql/analytics_clean_phase_2b.sql)
- Validation: [`backend/database/sql/analytics_clean_phase_2b_validation.sql`](../backend/database/sql/analytics_clean_phase_2b_validation.sql)

## Current application status

Laravel still queries `public.vw_moodle_*` and selected raw `public.mdl_*` tables. The application has not yet been switched to `analytics_clean`.

Do not restore `public.mdl_user` fields until Phase 2C updates Laravel and the API/UI tests pass against the new clean views.

## Next phase

Phase 2C should:

1. Update analytics models and services to query `analytics_clean`.
2. Use the `gender` column from `analytics_clean.students` instead of reading `public.mdl_user.phone1`.
3. Run backend tests and compare API responses.
4. Test dashboard pages.
5. Keep raw data unchanged during the application switch.

