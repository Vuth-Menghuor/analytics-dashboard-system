CREATE OR REPLACE VIEW analytics_clean.courses AS
SELECT
    c.id,
    coalesce(nullif(m.display_name, ''), c.fullname)::varchar(254) AS course_name,
    c.shortname,
    c.category,
    c.visible,
    to_timestamp(c.startdate::double precision) AS start_date,
    to_timestamp(c.enddate::double precision) AS end_date,
    c.fullname AS raw_course_name,
    m.proposed_course_family,
    m.family_status,
    m.data_quality_status,
    coalesce(m.recommended_action, 'keep') AS recommended_action,
    coalesce(cat.name, 'Uncategorized')::varchar(255) AS category_name
FROM public.mdl_course c
LEFT JOIN analytics_clean.course_mapping m ON m.course_id = c.id
LEFT JOIN public.mdl_course_categories cat ON cat.id = c.category
WHERE c.id <> 1
  AND coalesce(m.recommended_action, 'keep') <> 'exclude_from_analytics';

CREATE OR REPLACE VIEW analytics_clean.enrollments AS
SELECT
    ue.id AS enrolment_id,
    ue.userid,
    e.courseid,
    coalesce(nullif(m.display_name, ''), c.fullname)::varchar(254) AS course_name,
    ue.status,
    to_timestamp(ue.timestart::double precision) AS start_time,
    to_timestamp(ue.timeend::double precision) AS end_time,
    to_timestamp(ue.timecreated::double precision) AS created_time
FROM public.mdl_user_enrolments ue
JOIN public.mdl_enrol e ON e.id = ue.enrolid
JOIN public.mdl_course c ON c.id = e.courseid
LEFT JOIN analytics_clean.course_mapping m ON m.course_id = c.id
WHERE c.id <> 1
  AND coalesce(m.recommended_action, 'keep') <> 'exclude_from_analytics';
