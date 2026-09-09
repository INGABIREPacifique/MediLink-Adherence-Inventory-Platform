-- Enables real per-facility/per-district breakdowns on the Ministry
-- tier (Sector Reports, Sector Detail, Adherence Map, District
-- Facility), which currently show honest pilot-wide numbers because
-- patients aren't linked to a specific facility. Same for
-- inventory_items, needed for real per-facility stock correlation.
--
-- Nullable: this pilot only has one real facility relationship so far
-- (existing patients predate this column), so nothing is backfilled
-- here beyond pointing the pilot's patients at Kigali Central Hospital,
-- which is the pilot's actual site per the founding proposal.

alter table patients
  add column facility_id uuid references facilities(id);

alter table inventory_items
  add column facility_id uuid references facilities(id);

comment on column patients.facility_id is
  'Which facility this patient is enrolled at. Null for patients enrolled before this migration. Nurse Enrollment (Staff Registration) should be updated to set this going forward.';

comment on column inventory_items.facility_id is
  'Which facility this stock item belongs to. Null for items created before this migration.';

-- Backfill this pilot's existing data to Kigali Central Hospital, the
-- pilot's actual site (see 0023_seed_ministry_demo.sql) -- this is real
-- backfill, not fabricated: every patient/item in this database today
-- genuinely was enrolled/logged as part of that single-facility pilot,
-- per the handoff doc's own pilot scope description.
update patients
  set facility_id = (select id from facilities where name = 'Kigali Central Hospital')
  where facility_id is null;

update inventory_items
  set facility_id = (select id from facilities where name = 'Kigali Central Hospital')
  where facility_id is null;
