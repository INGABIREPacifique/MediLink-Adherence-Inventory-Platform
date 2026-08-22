-- The actual rule-based engine the proposal describes (§3.1, §4):
-- "If a dose confirmation is missed, the system escalates automatically...
--  The same logic applies to missed follow-up appointments -- the system
--  flags the patient to clinic staff before the visit window closes,
--  rather than after."
--
-- Until this migration, every escalation in the database was seeded by
-- hand -- nothing actually detected a missed dose or an upcoming
-- unconfirmed appointment on its own. This is the real trigger.

-- ---------- Extend schema to link escalations to their real source ----------

alter table escalations
  add column if not exists dose_reminder_id uuid references dose_reminders(id),
  add column if not exists appointment_id uuid references appointments(id),
  add column if not exists trigger_type text default 'missed_dose'
    check (trigger_type in ('missed_dose', 'missed_appointment'));

alter table appointments
  add column if not exists confirmed boolean not null default false,
  add column if not exists flagged_at timestamptz;

-- ---------- Function: detect missed doses past the configured window ----------

create or replace function check_missed_doses() returns void as $$
declare
  rules record;
begin
  select * into rules from escalation_rules limit 1;

  insert into escalations (patient_id, medication, phase, missed_at, status, dose_reminder_id, trigger_type)
  select
    p.id,
    pr.medication,
    'Dose ' || pr.times_per_day || 'x daily',
    dr.scheduled_for,
    'pending',
    dr.id,
    'missed_dose'
  from dose_reminders dr
  join prescriptions pr on pr.id = dr.prescription_id
  join patients p on p.id = pr.patient_id
  where dr.confirmed = false
    and dr.scheduled_for < now() - make_interval(mins => coalesce(rules.missed_dose_window_minutes, 240))
    and not exists (select 1 from escalations e where e.dose_reminder_id = dr.id);
end;
$$ language plpgsql security definer;

-- ---------- Function: flag upcoming unconfirmed appointments (proactive, before the window closes) ----------

create or replace function check_upcoming_appointments() returns void as $$
begin
  update appointments
  set flagged_at = now()
  where status = 'scheduled'
    and confirmed = false
    and flagged_at is null
    and scheduled_for <= current_date + 1; -- "before the visit window closes", per proposal §3.1

  insert into escalations (patient_id, medication, phase, missed_at, status, appointment_id, trigger_type)
  select
    a.patient_id,
    'Follow-up appointment',
    'Scheduled ' || a.scheduled_for,
    now(),
    'pending',
    a.id,
    'missed_appointment'
  from appointments a
  where a.flagged_at is not null
    and a.status = 'scheduled'
    and a.confirmed = false
    and not exists (select 1 from escalations e where e.appointment_id = a.id);
end;
$$ language plpgsql security definer;

-- ---------- Schedule both to run automatically every 15 minutes ----------
-- Requires the pg_cron extension. On Supabase this is usually enabled via
-- Database -> Extensions in the dashboard if the "create extension" below
-- fails for your project's plan/permissions -- see README for the manual
-- fallback (a "Run Escalation Check" button that calls these functions
-- on demand, which works with zero extra setup).

create extension if not exists pg_cron;

select cron.schedule('check-missed-doses', '*/15 * * * *', $$select check_missed_doses()$$);
select cron.schedule('check-upcoming-appointments', '*/15 * * * *', $$select check_upcoming_appointments()$$);
