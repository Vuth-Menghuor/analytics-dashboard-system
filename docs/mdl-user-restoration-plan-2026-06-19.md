# Moodle User Raw-Field Restoration Plan

Date: 2026-06-19  
Database: `projecti5`  
Status: Executed and validated

## Purpose

Restore the original Moodle values for the three fields that were previously cleaned directly in `public.mdl_user`:

- `phone1`
- `institution`
- `department`

The dashboard now reads canonical values from `analytics_clean`, so restoring these raw values should not change dashboard output.

## Prepared SQL files

- Read-only dry run: [`backend/database/sql/restore_mdl_user_dimensions_dry_run.sql`](../backend/database/sql/restore_mdl_user_dimensions_dry_run.sql)
- Guarded restoration: [`backend/database/sql/restore_mdl_user_dimensions.sql`](../backend/database/sql/restore_mdl_user_dimensions.sql)
- Guarded rollback: [`backend/database/sql/rollback_mdl_user_dimensions.sql`](../backend/database/sql/rollback_mdl_user_dimensions.sql)

## Dry-run results

| Check | Result |
|---|---:|
| Live `mdl_user` rows | 22,131 |
| Safety snapshot rows | 22,131 |
| Rows changed since snapshot | 0 |
| `phone1` values to restore | 15,329 |
| Institution values to restore | 551 |
| Department values to restore | 2,243 |
| Simulated gender output mismatches | 0 |
| Simulated institution output mismatches | 0 |
| Simulated department output mismatches | 0 |

The configured `projecti5` database role has the required `UPDATE` permission on `public.mdl_user` and `SELECT` permission on the recovery snapshots.

## Restoration sources

| Target field | Recovery source |
|---|---|
| `public.mdl_user.phone1` | `analytics_recovery.gender_backup_20260619.phone1` |
| `public.mdl_user.institution` | `analytics_recovery.institution_backup_20260619.institution` |
| `public.mdl_user.department` | `analytics_recovery.department_backup1_20260619.department` |

The earliest department backup is used because it predates the normalization represented in backup 2.

## Restoration safeguards

The restoration script:

1. Opens a transaction.
2. Locks `public.mdl_user` against concurrent writes.
3. Requires both live and snapshot tables to contain exactly 22,131 rows.
4. Aborts if any `mdl_user` row changed after the Phase 1 snapshot.
5. Updates only `phone1`, `institution`, and `department`.
6. Verifies all restored values match their selected recovery sources.
7. Verifies no non-target columns changed.
8. Verifies `analytics_clean` still reproduces the pre-restoration cleaned values.
9. Commits only when every validation succeeds.

Any failed assertion causes the transaction to roll back.

## Rollback safeguards

The rollback script restores the three fields to their exact Phase 1 cleaned-state snapshot. It refuses to run if the raw fields no longer match the immediately restored state, preventing accidental overwriting of later edits.

## Execution result

The guarded restoration was executed successfully on 2026-06-19.

Post-restoration validation:

| Check | Result |
|---|---:|
| Raw `phone1` mismatches | 0 |
| Raw institution mismatches | 0 |
| Raw department mismatches | 0 |
| Non-target column mismatches | 0 |
| Clean student-view mismatches | 0 |
| Clean teacher-view mismatches | 0 |
| Clean user-activity mismatches | 0 |

The original raw values are restored, and `analytics_clean` continues to reproduce the pre-restoration dashboard output.

The older Phase 2B validation file compares clean views to the legacy `public.vw_moodle_*` views. Student and teacher differences are expected after restoration because those legacy views expose raw fields directly. Use [`analytics_clean_post_restoration_validation.sql`](../backend/database/sql/analytics_clean_post_restoration_validation.sql) after restoration.

Final regression results:

- Backend tests: 20 passed, 68 assertions
- Students: 17,435
- Male: 8,136
- Female: 4,499
- Gender not filled: 4,800
- Courses: 1,523
- ITC students: 9,734

The rollback SQL remains available if the raw dimensions need to be returned to their Phase 1 cleaned-table state.
