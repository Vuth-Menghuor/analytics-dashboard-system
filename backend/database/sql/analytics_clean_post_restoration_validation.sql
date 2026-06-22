WITH expected_users AS (
    SELECT
        s.id,
        s.username,
        s.firstname,
        s.lastname,
        s.email,
        nullif(btrim(s.phone1), '') AS gender,
        nullif(btrim(s.institution), '') AS institution,
        nullif(btrim(s.department), '') AS department,
        nullif(btrim(s.city), '') AS city,
        nullif(btrim(s.country), '') AS country,
        s.suspended,
        s.confirmed,
        s.deleted,
        s.lastlogin,
        s.lastaccess
    FROM analytics_recovery.mdl_user_20260619 s
),
expected_students AS (
    SELECT DISTINCT
        e.id,
        e.username,
        e.firstname,
        e.lastname,
        e.email,
        e.gender,
        e.institution,
        e.department,
        e.city,
        e.country,
        e.suspended,
        e.confirmed,
        e.deleted,
        e.lastlogin,
        e.lastaccess
    FROM expected_users e
    JOIN public.mdl_role_assignments ra ON ra.userid = e.id
    JOIN public.mdl_role r ON r.id = ra.roleid
    WHERE r.shortname = 'student'
      AND e.deleted = 0
),
clean_students AS (
    SELECT
        id,
        username,
        firstname,
        lastname,
        email,
        gender,
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
expected_teachers AS (
    SELECT DISTINCT
        e.id,
        e.username,
        e.firstname,
        e.lastname,
        e.email,
        e.gender,
        e.institution,
        e.department,
        e.city,
        e.country,
        r.shortname AS role_name,
        e.suspended,
        e.confirmed,
        e.deleted,
        e.lastlogin,
        e.lastaccess
    FROM expected_users e
    JOIN public.mdl_role_assignments ra ON ra.userid = e.id
    JOIN public.mdl_role r ON r.id = ra.roleid
    WHERE r.shortname IN ('teacher', 'editingteacher')
      AND e.deleted = 0
),
clean_teachers AS (
    SELECT
        id,
        username,
        firstname,
        lastname,
        email,
        gender,
        institution,
        department,
        city,
        country,
        role_name,
        suspended,
        confirmed,
        deleted,
        lastlogin,
        lastaccess
    FROM analytics_clean.teachers
),
expected_activity AS (
    SELECT
        id AS userid,
        username,
        firstname,
        lastname,
        email,
        CASE
            WHEN lastlogin = 0 THEN 'Never logged in'
            ELSE to_char(
                to_timestamp(lastlogin::double precision),
                'YYYY-MM-DD HH24:MI:SS'
            )
        END AS last_login_time,
        CASE
            WHEN lastaccess = 0 THEN 'Never accessed'
            ELSE to_char(
                to_timestamp(lastaccess::double precision),
                'YYYY-MM-DD HH24:MI:SS'
            )
        END AS last_access_time,
        suspended,
        confirmed,
        deleted,
        gender,
        institution,
        department,
        city
    FROM expected_users
    WHERE deleted = 0
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
        deleted,
        gender,
        institution,
        department,
        city
    FROM analytics_clean.user_activity
)
SELECT
    'students'::text AS validation_name,
    (
        SELECT count(*) FROM (
            SELECT * FROM expected_students
            EXCEPT
            SELECT * FROM clean_students
        ) missing
    ) + (
        SELECT count(*) FROM (
            SELECT * FROM clean_students
            EXCEPT
            SELECT * FROM expected_students
        ) extra
    ) AS mismatch_count
UNION ALL
SELECT
    'teachers',
    (
        SELECT count(*) FROM (
            SELECT * FROM expected_teachers
            EXCEPT
            SELECT * FROM clean_teachers
        ) missing
    ) + (
        SELECT count(*) FROM (
            SELECT * FROM clean_teachers
            EXCEPT
            SELECT * FROM expected_teachers
        ) extra
    )
UNION ALL
SELECT
    'user_activity',
    (
        SELECT count(*) FROM (
            SELECT * FROM expected_activity
            EXCEPT
            SELECT * FROM clean_activity
        ) missing
    ) + (
        SELECT count(*) FROM (
            SELECT * FROM clean_activity
            EXCEPT
            SELECT * FROM expected_activity
        ) extra
    )
ORDER BY validation_name;
