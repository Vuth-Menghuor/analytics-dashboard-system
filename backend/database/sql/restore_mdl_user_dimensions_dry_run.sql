WITH restoration_counts AS (
    SELECT
        count(*) FILTER (
            WHERE u.phone1 IS DISTINCT FROM g.phone1
        ) AS gender_rows,
        count(*) FILTER (
            WHERE u.institution IS DISTINCT FROM i.institution
        ) AS institution_rows,
        count(*) FILTER (
            WHERE u.department IS DISTINCT FROM d.department
        ) AS department_rows
    FROM public.mdl_user u
    JOIN analytics_recovery.gender_backup_20260619 g USING (id)
    JOIN analytics_recovery.institution_backup_20260619 i USING (id)
    JOIN analytics_recovery.department_backup1_20260619 d USING (id)
),
snapshot_integrity AS (
    SELECT
        (
            SELECT count(*)
            FROM public.mdl_user u
            FULL JOIN analytics_recovery.mdl_user_20260619 s USING (id)
            WHERE to_jsonb(u) IS DISTINCT FROM to_jsonb(s)
        ) AS changed_since_snapshot,
        (
            SELECT count(*)
            FROM public.mdl_user
        ) AS live_rows,
        (
            SELECT count(*)
            FROM analytics_recovery.mdl_user_20260619
        ) AS snapshot_rows
),
clean_layer_simulation AS (
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
    FROM analytics_recovery.mdl_user_20260619 u
    JOIN analytics_recovery.gender_backup_20260619 g USING (id)
    JOIN analytics_recovery.institution_backup_20260619 i USING (id)
    JOIN analytics_recovery.department_backup1_20260619 d USING (id)
    LEFT JOIN analytics_clean.gender_mapping gm ON gm.source_value = g.phone1
    LEFT JOIN analytics_clean.institution_mapping im ON im.source_value = i.institution
    LEFT JOIN analytics_clean.department_mapping dm ON dm.source_value = d.department
)
SELECT
    'snapshot_integrity'::text AS check_group,
    'changed_since_snapshot'::text AS check_name,
    changed_since_snapshot::bigint AS result
FROM snapshot_integrity
UNION ALL
SELECT 'snapshot_integrity', 'live_rows', live_rows
FROM snapshot_integrity
UNION ALL
SELECT 'snapshot_integrity', 'snapshot_rows', snapshot_rows
FROM snapshot_integrity
UNION ALL
SELECT 'rows_to_restore', 'phone1', gender_rows
FROM restoration_counts
UNION ALL
SELECT 'rows_to_restore', 'institution', institution_rows
FROM restoration_counts
UNION ALL
SELECT 'rows_to_restore', 'department', department_rows
FROM restoration_counts
UNION ALL
SELECT 'clean_layer_simulation', 'gender_mismatches', gender_mismatches
FROM clean_layer_simulation
UNION ALL
SELECT 'clean_layer_simulation', 'institution_mismatches', institution_mismatches
FROM clean_layer_simulation
UNION ALL
SELECT 'clean_layer_simulation', 'department_mismatches', department_mismatches
FROM clean_layer_simulation
ORDER BY check_group, check_name;
