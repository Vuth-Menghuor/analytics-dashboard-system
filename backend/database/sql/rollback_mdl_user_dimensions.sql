BEGIN;

LOCK TABLE public.mdl_user IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
    rows_not_in_restored_state bigint;
BEGIN
    SELECT count(*) INTO rows_not_in_restored_state
    FROM public.mdl_user u
    JOIN analytics_recovery.gender_backup_20260619 g USING (id)
    JOIN analytics_recovery.institution_backup_20260619 i USING (id)
    JOIN analytics_recovery.department_backup1_20260619 d USING (id)
    WHERE u.phone1 IS DISTINCT FROM g.phone1
       OR u.institution IS DISTINCT FROM i.institution
       OR u.department IS DISTINCT FROM d.department;

    IF rows_not_in_restored_state <> 0 THEN
        RAISE EXCEPTION
            'Raw dimensions no longer match the restored state: % rows differ',
            rows_not_in_restored_state;
    END IF;
END
$$;

UPDATE public.mdl_user u
SET
    phone1 = s.phone1,
    institution = s.institution,
    department = s.department
FROM analytics_recovery.mdl_user_20260619 s
WHERE u.id = s.id
  AND (
      u.phone1 IS DISTINCT FROM s.phone1
      OR u.institution IS DISTINCT FROM s.institution
      OR u.department IS DISTINCT FROM s.department
  );

DO $$
DECLARE
    rollback_mismatches bigint;
BEGIN
    SELECT count(*) INTO rollback_mismatches
    FROM public.mdl_user u
    JOIN analytics_recovery.mdl_user_20260619 s USING (id)
    WHERE to_jsonb(u) IS DISTINCT FROM to_jsonb(s);

    IF rollback_mismatches <> 0 THEN
        RAISE EXCEPTION
            'Rollback validation failed: % rows differ from safety snapshot',
            rollback_mismatches;
    END IF;
END
$$;

COMMIT;
