BEGIN;

LOCK TABLE public.mdl_user IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
    live_rows bigint;
    snapshot_rows bigint;
    changed_since_snapshot bigint;
BEGIN
    SELECT count(*) INTO live_rows
    FROM public.mdl_user;

    SELECT count(*) INTO snapshot_rows
    FROM analytics_recovery.mdl_user_20260619;

    SELECT count(*) INTO changed_since_snapshot
    FROM public.mdl_user u
    FULL JOIN analytics_recovery.mdl_user_20260619 s USING (id)
    WHERE to_jsonb(u) IS DISTINCT FROM to_jsonb(s);

    IF live_rows <> 22131 OR snapshot_rows <> 22131 THEN
        RAISE EXCEPTION
            'Unexpected row count. Live: %, snapshot: %',
            live_rows,
            snapshot_rows;
    END IF;

    IF changed_since_snapshot <> 0 THEN
        RAISE EXCEPTION
            'mdl_user changed after the safety snapshot: % rows differ',
            changed_since_snapshot;
    END IF;
END
$$;

UPDATE public.mdl_user u
SET phone1 = g.phone1
FROM analytics_recovery.gender_backup_20260619 g
WHERE u.id = g.id
  AND u.phone1 IS DISTINCT FROM g.phone1;

UPDATE public.mdl_user u
SET institution = i.institution
FROM analytics_recovery.institution_backup_20260619 i
WHERE u.id = i.id
  AND u.institution IS DISTINCT FROM i.institution;

UPDATE public.mdl_user u
SET department = d.department
FROM analytics_recovery.department_backup1_20260619 d
WHERE u.id = d.id
  AND u.department IS DISTINCT FROM d.department;

DO $$
DECLARE
    raw_mismatches bigint;
    clean_mismatches bigint;
    non_target_mismatches bigint;
BEGIN
    SELECT count(*) INTO raw_mismatches
    FROM public.mdl_user u
    JOIN analytics_recovery.gender_backup_20260619 g USING (id)
    JOIN analytics_recovery.institution_backup_20260619 i USING (id)
    JOIN analytics_recovery.department_backup1_20260619 d USING (id)
    WHERE u.phone1 IS DISTINCT FROM g.phone1
       OR u.institution IS DISTINCT FROM i.institution
       OR u.department IS DISTINCT FROM d.department;

    IF raw_mismatches <> 0 THEN
        RAISE EXCEPTION
            'Raw restoration validation failed: % rows differ',
            raw_mismatches;
    END IF;

    SELECT count(*) INTO non_target_mismatches
    FROM public.mdl_user u
    JOIN analytics_recovery.mdl_user_20260619 s USING (id)
    WHERE (to_jsonb(u) - ARRAY['phone1', 'institution', 'department'])
        IS DISTINCT FROM
        (to_jsonb(s) - ARRAY['phone1', 'institution', 'department']);

    IF non_target_mismatches <> 0 THEN
        RAISE EXCEPTION
            'Non-target mdl_user columns changed: % rows differ',
            non_target_mismatches;
    END IF;

    SELECT count(*) INTO clean_mismatches
    FROM analytics_recovery.mdl_user_20260619 expected
    JOIN public.mdl_user raw USING (id)
    LEFT JOIN analytics_clean.gender_mapping gm
        ON gm.source_value = raw.phone1
    LEFT JOIN analytics_clean.institution_mapping im
        ON im.source_value = raw.institution
    LEFT JOIN analytics_clean.department_mapping dm
        ON dm.source_value = raw.department
    WHERE (
        CASE
            WHEN gm.source_value IS NOT NULL THEN gm.cleaned_value
            ELSE nullif(btrim(raw.phone1), '')
        END
    ) IS DISTINCT FROM nullif(btrim(expected.phone1), '')
       OR (
        CASE
            WHEN im.source_value IS NOT NULL THEN im.cleaned_value
            ELSE nullif(btrim(raw.institution), '')
        END
    ) IS DISTINCT FROM nullif(btrim(expected.institution), '')
       OR (
        CASE
            WHEN dm.source_value IS NOT NULL THEN dm.cleaned_value
            ELSE nullif(btrim(raw.department), '')
        END
    ) IS DISTINCT FROM nullif(btrim(expected.department), '');

    IF clean_mismatches <> 0 THEN
        RAISE EXCEPTION
            'Clean-layer output validation failed: % rows differ',
            clean_mismatches;
    END IF;
END
$$;

COMMIT;
