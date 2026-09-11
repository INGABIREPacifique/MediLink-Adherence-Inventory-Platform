-- Fixes the "more than one row returned by a subquery" error from
-- 0023/0024: facilities had no uniqueness constraint on name, so
-- re-running 0023's seed insert (e.g. after an earlier error forced a
-- retry) created duplicate 'Kigali Central Hospital' rows. Any query
-- doing `where name = 'Kigali Central Hospital'` expecting one row then
-- broke.
--
-- This migration is itself safe to run multiple times.

-- Step 1: for every set of duplicate-named facilities, keep the oldest
-- row and repoint every real foreign key reference at it before
-- deleting the newer duplicates -- so nothing (a patient, an inventory
-- item, a report, a staff profile) silently loses its facility link.
do $$
declare
  dup record;
  keep_id uuid;
begin
  for dup in
    select name, min(created_at) as first_created
    from facilities
    group by name
    having count(*) > 1
  loop
    select id into keep_id from facilities where name = dup.name and created_at = dup.first_created limit 1;

    update patients set facility_id = keep_id
      where facility_id in (select id from facilities where name = dup.name and id != keep_id);
    update inventory_items set facility_id = keep_id
      where facility_id in (select id from facilities where name = dup.name and id != keep_id);
    update ministry_reports set facility_id = keep_id
      where facility_id in (select id from facilities where name = dup.name and id != keep_id);
    update profiles set facility_id = keep_id
      where facility_id in (select id from facilities where name = dup.name and id != keep_id);

    delete from facilities where name = dup.name and id != keep_id;
  end loop;
end $$;

-- Step 2: prevent this from ever happening again.
alter table facilities add constraint facilities_name_unique unique (name);
