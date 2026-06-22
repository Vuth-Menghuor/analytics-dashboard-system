WITH
public_students AS (
    SELECT
        id,
        username,
        firstname,
        lastname,
        email,
        nullif(btrim(institution), '') AS institution,
        nullif(btrim(department), '') AS department,
        nullif(btrim(city), '') AS city,
        nullif(btrim(country), '') AS country,
        suspended,
        confirmed,
        deleted,
        lastlogin,
        lastaccess
    FROM public.vw_moodle_students
),
clean_students AS (
    SELECT
        id,
        username,
        firstname,
        lastname,
        email,
        institution,
        department,
        city,
        country,
        suspended,
        confirmed,
        deleted,
        lastlogin,
        lastaccess
    FROM analytics_clean.students
),
public_teachers AS (
    SELECT
        id,
        username,
        firstname,
        lastname,
        email,
        nullif(btrim(institution), '') AS institution,
        nullif(btrim(department), '') AS department,
        nullif(btrim(city), '') AS city,
        nullif(btrim(country), '') AS country,
        role_name
    FROM public.vw_moodle_teachers
),
clean_teachers AS (
    SELECT
        id,
        username,
        firstname,
        lastname,
        email,
        institution,
        department,
        city,
        country,
        role_name
    FROM analytics_clean.teachers
),
public_activity AS (
    SELECT *
    FROM public.vw_moodle_user_activity
),
clean_activity AS (
    SELECT
        userid,
        username,
        firstname,
        lastname,
        email,
        last_login_time,
        last_access_time,
        suspended,
        confirmed,
        deleted
    FROM analytics_clean.user_activity
),
restoration_simulation AS (
    SELECT
        count(*) FILTER (
            WHERE (
                CASE
                    WHEN gm.source_value IS NOT NULL THEN gm.cleaned_value
                    ELSE nullif(btrim(g.phone1), '')
                END
            ) IS DISTINCT FROM nullif(btrim(u.phone1), '')
        ) AS gender_mismatches,
        count(*) FILTER (
            WHERE (
                CASE
                    WHEN im.source_value IS NOT NULL THEN im.cleaned_value
                    ELSE nullif(btrim(i.institution), '')
                END
            ) IS DISTINCT FROM nullif(btrim(u.institution), '')
        ) AS institution_mismatches,
        count(*) FILTER (
            WHERE (
                CASE
                    WHEN dm.source_value IS NOT NULL THEN dm.cleaned_value
                    ELSE nullif(btrim(d.department), '')
                END
            ) IS DISTINCT FROM nullif(btrim(u.department), '')
        ) AS department_mismatches
    FROM public.mdl_user u
    JOIN analytics_recovery.gender_backup_20260619 g USING (id)
    JOIN analytics_recovery.institution_backup_20260619 i USING (id)
    JOIN analytics_recovery.department_backup1_20260619 d USING (id)
    LEFT JOIN analytics_clean.gender_mapping gm ON gm.source_value = g.phone1
    LEFT JOIN analytics_clean.institution_mapping im ON im.source_value = i.institution
    LEFT JOIN analytics_clean.department_mapping dm ON dm.source_value = d.department
)
SELECT
    'current_view_equivalence'::text AS validation_group,
    'students'::text AS validation_name,
    (
        SELECT count(*) FROM (
            SELECT * FROM public_students
            EXCEPT
            SELECT * FROM clean_students
        ) missing
    ) + (
        SELECT count(*) FROM (
            SELECT * FROM clean_students
            EXCEPT
            SELECT * FROM public_students
        ) extra
    ) AS mismatch_count
UNION ALL
SELECT
    'current_view_equivalence',
    'teachers',
    (
        SELECT count(*) FROM (
            SELECT * FROM public_teachers
            EXCEPT
            SELECT * FROM clean_teachers
        ) missing
    ) + (
        SELECT count(*) FROM (
            SELECT * FROM clean_teachers
            EXCEPT
            SELECT * FROM public_teachers
        ) extra
    )
UNION ALL
SELECT
    'current_view_equivalence',
    'courses',
    (
        SELECT count(*) FROM (
            SELECT * FROM public.vw_moodle_courses
            EXCEPT
            SELECT * FROM analytics_clean.courses
        ) missing
    ) + (
        SELECT count(*) FROM (
            SELECT * FROM analytics_clean.courses
            EXCEPT
            SELECT * FROM public.vw_moodle_courses
        ) extra
    )
UNION ALL
SELECT
    'current_view_equivalence',
    'enrollments',
    (
        SELECT count(*) FROM (
            SELECT * FROM public.vw_moodle_enrollments
            EXCEPT
            SELECT * FROM analytics_clean.enrollments
        ) missing
    ) + (
        SELECT count(*) FROM (
            SELECT * FROM analytics_clean.enrollments
            EXCEPT
            SELECT * FROM public.vw_moodle_enrollments
        ) extra
    )
UNION ALL
SELECT
    'current_view_equivalence',
    'user_activity',
    (
        SELECT count(*) FROM (
            SELECT * FROM public_activity
            EXCEPT
            SELECT * FROM clean_activity
        ) missing
    ) + (
        SELECT count(*) FROM (
            SELECT * FROM clean_activity
            EXCEPT
            SELECT * FROM public_activity
        ) extra
    )
UNION ALL
SELECT
    'restoration_simulation',
    'gender',
    gender_mismatches
FROM restoration_simulation
UNION ALL
SELECT
    'restoration_simulation',
    'institution',
    institution_mismatches
FROM restoration_simulation
UNION ALL
SELECT
    'restoration_simulation',
    'department',
    department_mismatches
FROM restoration_simulation
ORDER BY validation_group, validation_name;
