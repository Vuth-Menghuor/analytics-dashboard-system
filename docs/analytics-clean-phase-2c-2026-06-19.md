# Clean Analytics Application Switch — Phase 2C

Date: 2026-06-19  
Application: Laravel backend  
Database: `projecti5`

## Outcome

The backend analytics read paths now use the `analytics_clean` schema.

No raw Moodle rows were updated, restored, or deleted during this phase. Existing `public.vw_moodle_*` views also remain unchanged.

## Model changes

| Model | New source |
|---|---|
| `MoodleStudent` | `analytics_clean.students` |
| `MoodleTeacher` | `analytics_clean.teachers` |
| `MoodleCourse` | `analytics_clean.courses` |
| `MoodleEnrollment` | `analytics_clean.enrollments` |
| `MoodleUserActivity` | `analytics_clean.user_activity` |

## Service changes

All explicit joins and `from(...)` references to `vw_moodle_*` in the analytics services were replaced with their `analytics_clean.*` equivalents.

Student gender now comes directly from `analytics_clean.students.gender`. The backend no longer recalculates dashboard gender from raw `public.mdl_user.phone1`.

This applies to:

- student lists and profiles
- gender filters
- `Not filled` gender filters
- gender distribution charts
- institution and department filters
- manager and partner dashboard scopes

Raw fact tables remain in use where no clean view was created:

- `public.mdl_course_completions`
- `public.mdl_logstore_standard_log`
- `public.mdl_quiz_attempts`
- `public.mdl_assign_submission`

These fact tables were not part of the modified user-dimension cleanup.

## Validation

### Backend tests

- Tests: 20
- Passed: 20
- Assertions: 68

### Live manager-scope smoke checks

| Check | Result |
|---|---:|
| Summary students | 17,435 |
| Student list total | 17,435 |
| Male filter | 8,136 |
| `Not filled` gender filter | 4,800 |
| Institution groups | 17 |
| Department groups | 87 |
| City groups | 18 |
| Gender groups | 3 |
| Courses | 1,523 |
| Popular courses | 10 |
| Course completion rows | 10 |
| Course-view rows | 10 |

### Live partner-scope smoke checks

Using institution `ITC`:

| Check | Result |
|---|---:|
| Student list total | 9,734 |
| Summary students | 9,734 |
| Scoped courses | 767 |
| Popular-course rows | 10 |
| Completion rows | 10 |
| Course-view rows | 10 |

### Code quality

- PHP syntax checks passed.
- Laravel Pint passed for all files changed in Phase 2C.
- No `vw_moodle_*`, raw `mdl_user` join, or `phone1` cleanup reference remains in the analytics service layer.

## Current architecture

```text
public.mdl_* raw Moodle tables
        ↓
analytics_clean mapping tables and views
        ↓
Laravel analytics models and services
        ↓
Dashboard API and UI
```

## Next phase

Before restoring raw values:

1. Manually smoke-test the dashboard pages in the browser.
2. Confirm institution, department, gender, course, and activity screens look unchanged.
3. Prepare a transactional restoration script for `phone1`, `institution`, and `department`.
4. Validate the restoration script against recovery snapshots without executing it.
5. Restore only after explicit approval.

