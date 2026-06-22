CREATE TABLE analytics_clean.gender_mapping (
    source_value text PRIMARY KEY,
    cleaned_value text NULL,
    affected_users bigint NOT NULL,
    captured_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO analytics_clean.gender_mapping (
    source_value,
    cleaned_value,
    affected_users
)
SELECT
    b.phone1,
    min(nullif(btrim(u.phone1), '')),
    count(*)
FROM analytics_recovery.gender_backup_20260619 b
JOIN public.mdl_user u USING (id)
WHERE b.phone1 IS DISTINCT FROM u.phone1
GROUP BY b.phone1;

CREATE TABLE analytics_clean.institution_mapping (
    source_value text PRIMARY KEY,
    cleaned_value text NULL,
    affected_users bigint NOT NULL,
    captured_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO analytics_clean.institution_mapping (
    source_value,
    cleaned_value,
    affected_users
)
SELECT
    b.institution,
    min(nullif(btrim(u.institution), '')),
    count(*)
FROM analytics_recovery.institution_backup_20260619 b
JOIN public.mdl_user u USING (id)
WHERE b.institution IS DISTINCT FROM u.institution
GROUP BY b.institution;

CREATE TABLE analytics_clean.department_mapping (
    source_value text PRIMARY KEY,
    cleaned_value text NULL,
    affected_users bigint NOT NULL,
    captured_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO analytics_clean.department_mapping (
    source_value,
    cleaned_value,
    affected_users
)
SELECT
    b.department,
    min(nullif(btrim(u.department), '')),
    count(*)
FROM analytics_recovery.department_backup1_20260619 b
JOIN public.mdl_user u USING (id)
WHERE b.department IS DISTINCT FROM u.department
GROUP BY b.department;

CREATE VIEW analytics_clean.students AS
SELECT DISTINCT
    u.id,
    u.username,
    u.firstname,
    u.lastname,
    u.email,
    CASE
        WHEN gm.source_value IS NOT NULL THEN gm.cleaned_value
        ELSE nullif(btrim(u.phone1), '')
    END AS gender,
    CASE
        WHEN im.source_value IS NOT NULL THEN im.cleaned_value
        ELSE nullif(btrim(u.institution), '')
    END AS institution,
    CASE
        WHEN dm.source_value IS NOT NULL THEN dm.cleaned_value
        ELSE nullif(btrim(u.department), '')
    END AS department,
    nullif(btrim(u.city), '') AS city,
    nullif(btrim(u.country), '') AS country,
    u.suspended,
    u.confirmed,
    u.deleted,
    u.lastlogin,
    u.lastaccess,
    u.phone1 AS raw_gender,
    u.institution AS raw_institution,
    u.department AS raw_department,
    u.city AS raw_city
FROM public.mdl_user u
JOIN public.mdl_role_assignments ra ON ra.userid = u.id
JOIN public.mdl_role r ON r.id = ra.roleid
LEFT JOIN analytics_clean.gender_mapping gm ON gm.source_value = u.phone1
LEFT JOIN analytics_clean.institution_mapping im ON im.source_value = u.institution
LEFT JOIN analytics_clean.department_mapping dm ON dm.source_value = u.department
WHERE r.shortname = 'student'
  AND u.deleted = 0;

CREATE VIEW analytics_clean.teachers AS
SELECT DISTINCT
    u.id,
    u.username,
    u.firstname,
    u.lastname,
    u.email,
    CASE
        WHEN gm.source_value IS NOT NULL THEN gm.cleaned_value
        ELSE nullif(btrim(u.phone1), '')
    END AS gender,
    CASE
        WHEN im.source_value IS NOT NULL THEN im.cleaned_value
        ELSE nullif(btrim(u.institution), '')
    END AS institution,
    CASE
        WHEN dm.source_value IS NOT NULL THEN dm.cleaned_value
        ELSE nullif(btrim(u.department), '')
    END AS department,
    nullif(btrim(u.city), '') AS city,
    nullif(btrim(u.country), '') AS country,
    r.shortname AS role_name,
    u.suspended,
    u.confirmed,
    u.deleted,
    u.lastlogin,
    u.lastaccess,
    u.phone1 AS raw_gender,
    u.institution AS raw_institution,
    u.department AS raw_department,
    u.city AS raw_city
FROM public.mdl_user u
JOIN public.mdl_role_assignments ra ON ra.userid = u.id
JOIN public.mdl_role r ON r.id = ra.roleid
LEFT JOIN analytics_clean.gender_mapping gm ON gm.source_value = u.phone1
LEFT JOIN analytics_clean.institution_mapping im ON im.source_value = u.institution
LEFT JOIN analytics_clean.department_mapping dm ON dm.source_value = u.department
WHERE r.shortname IN ('teacher', 'editingteacher')
  AND u.deleted = 0;

CREATE VIEW analytics_clean.courses AS
SELECT
    id,
    fullname AS course_name,
    shortname,
    category,
    visible,
    to_timestamp(startdate::double precision) AS start_date,
    to_timestamp(enddate::double precision) AS end_date
FROM public.mdl_course
WHERE id <> 1;

CREATE VIEW analytics_clean.enrollments AS
SELECT
    ue.id AS enrolment_id,
    ue.userid,
    e.courseid,
    c.fullname AS course_name,
    ue.status,
    to_timestamp(ue.timestart::double precision) AS start_time,
    to_timestamp(ue.timeend::double precision) AS end_time,
    to_timestamp(ue.timecreated::double precision) AS created_time
FROM public.mdl_user_enrolments ue
JOIN public.mdl_enrol e ON e.id = ue.enrolid
JOIN public.mdl_course c ON c.id = e.courseid
WHERE c.id <> 1;

CREATE VIEW analytics_clean.user_activity AS
SELECT
    u.id AS userid,
    u.username,
    u.firstname,
    u.lastname,
    u.email,
    CASE
        WHEN u.lastlogin = 0 THEN 'Never logged in'
        ELSE to_char(
            to_timestamp(u.lastlogin::double precision),
            'YYYY-MM-DD HH24:MI:SS'
        )
    END AS last_login_time,
    CASE
        WHEN u.lastaccess = 0 THEN 'Never accessed'
        ELSE to_char(
            to_timestamp(u.lastaccess::double precision),
            'YYYY-MM-DD HH24:MI:SS'
        )
    END AS last_access_time,
    u.suspended,
    u.confirmed,
    u.deleted,
    CASE
        WHEN gm.source_value IS NOT NULL THEN gm.cleaned_value
        ELSE nullif(btrim(u.phone1), '')
    END AS gender,
    CASE
        WHEN im.source_value IS NOT NULL THEN im.cleaned_value
        ELSE nullif(btrim(u.institution), '')
    END AS institution,
    CASE
        WHEN dm.source_value IS NOT NULL THEN dm.cleaned_value
        ELSE nullif(btrim(u.department), '')
    END AS department,
    nullif(btrim(u.city), '') AS city
FROM public.mdl_user u
LEFT JOIN analytics_clean.gender_mapping gm ON gm.source_value = u.phone1
LEFT JOIN analytics_clean.institution_mapping im ON im.source_value = u.institution
LEFT JOIN analytics_clean.department_mapping dm ON dm.source_value = u.department
WHERE u.deleted = 0;
