# Database Cleanup Migration Record

Date: 2026-06-19  
Database: `projecti5`  
Phase: 1 — safety snapshot only

## Objective

Preserve the current raw and previously cleaned user data before moving dashboard cleanup logic into a separate analytics layer.

No values in `public.mdl_user` or any other existing Moodle table were updated, deleted, or restored during this phase.

## Database changes

Created two schemas:

- `analytics_recovery` — dated recovery snapshots
- `analytics_clean` — reserved for future cleaned views and materialized views

Created these snapshot tables:

| Snapshot | Source |
|---|---|
| `analytics_recovery.mdl_user_20260619` | `public.mdl_user` |
| `analytics_recovery.gender_backup_20260619` | `public.mdl_user_backup_gender` |
| `analytics_recovery.institution_backup_20260619` | `public.mdl_user_backup_institution` |
| `analytics_recovery.department_backup1_20260619` | `public.mdl_user_department_backup` |
| `analytics_recovery.department_backup2_20260619` | `public.mdl_user_department_backup_2` |
| `analytics_recovery.view_definitions_20260619` | Current definitions of all `public.vw_moodle_*` views |

Each user-data snapshot has a primary key on `id`. The view-definition snapshot has a primary key on `view_name`.

`analytics_clean` was intentionally left empty. Creating the cleaned views belongs to Phase 2.

## Integrity verification

All source and snapshot tables contain 22,131 rows.

| Source | Snapshot mismatch count |
|---|---:|
| `public.mdl_user` | 0 |
| `public.mdl_user_backup_gender` | 0 |
| `public.mdl_user_backup_institution` | 0 |
| `public.mdl_user_department_backup` | 0 |
| `public.mdl_user_department_backup_2` | 0 |

Five current `vw_moodle_*` definitions were captured:

- `vw_moodle_courses`
- `vw_moodle_enrollments`
- `vw_moodle_students`
- `vw_moodle_teachers`
- `vw_moodle_user_activity`

The recovery snapshot uses approximately 16 MB in total.

## Existing modification evidence

Read-only comparisons made before and after the snapshot found:

- 15,329 current `mdl_user.phone1` values differ from `mdl_user_backup_gender`.
- 551 current `mdl_user.institution` values differ from `mdl_user_backup_institution`.
- The two department backups differ for 2,052 users.
- For all 2,052 of those users, the current department matches `mdl_user_department_backup_2`.
- A further 191 current departments differ from both department backups.

This suggests `mdl_user_department_backup` is earlier than `mdl_user_department_backup_2`, and that another department-cleanup step occurred after backup 2. The table names and comparisons are clues, not sufficient proof that backup 1 contains the authoritative original value for every user.

## Transaction notes

Initial attempts to add schema comments failed because of command quoting and PostgreSQL parameter-binding limitations. Each attempt ran inside a transaction and rolled back completely. The successful transaction created only the schemas and snapshot tables listed above.

## Current application behavior

The existing `vw_moodle_students` view selects `institution`, `department`, and related fields directly from `public.mdl_user`. Therefore, the UI currently receives the modified raw-table values through the view.

## Next phase

Before restoring any original values:

1. Define the required cleanup rules for gender, institution, and department.
2. Build cleaned views in `analytics_clean`.
3. Update Laravel models and queries to use that schema.
4. Compare API and UI results with the current dashboard.
5. Determine the authoritative original department source.
6. Only then restore raw `mdl_user` fields in a controlled transaction.
7. Give the dashboard database role read-only access to raw `mdl_*` tables.

Do not restore the July 28, 2025 dump over `projecti5`; it should only be loaded into a separate comparison database if needed.

## Phase 2A status

Read-only data profiling was completed on 2026-06-19. Findings and proposed cleanup rules are documented in [data-cleanup-profile-2026-06-19.md](data-cleanup-profile-2026-06-19.md).

No database data or view definitions were changed during Phase 2A.

## Phase 2B status

The clean analytics mapping tables and views were created on 2026-06-19. All current-view equivalence checks and raw-restoration simulations returned zero mismatches.

See [analytics-clean-phase-2b-2026-06-19.md](analytics-clean-phase-2b-2026-06-19.md) for the complete object inventory and validation results.

The application has not yet been switched to the new schema, and no raw Moodle values have been restored.

## Phase 2C status

The Laravel analytics models and services were switched to `analytics_clean` on 2026-06-19.

All 20 backend tests passed, manager and partner live smoke checks succeeded, and student gender no longer reads from raw `mdl_user.phone1`.

See [analytics-clean-phase-2c-2026-06-19.md](analytics-clean-phase-2c-2026-06-19.md).

Raw Moodle values have not yet been restored.

## Restoration preparation status

The restoration, dry-run, and rollback SQL files were prepared on 2026-06-19. Read-only validation found zero snapshot drift and zero simulated clean-layer mismatches.

See [mdl-user-restoration-plan-2026-06-19.md](mdl-user-restoration-plan-2026-06-19.md).

The guarded restoration was executed successfully on 2026-06-19.

The raw `phone1`, institution, and department values now match their selected original backups. No non-target `mdl_user` columns changed. Post-restoration clean-layer validation and all backend regression tests passed.
