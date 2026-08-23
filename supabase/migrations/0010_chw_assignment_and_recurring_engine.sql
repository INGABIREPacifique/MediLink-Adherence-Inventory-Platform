-- Three fixes:
--   1. Per-CHW patient assignment (was: every CHW saw every patient)
--   2. Dose reminders auto-extend indefinitely (was: 30-day one-time
--      generation at enrollment, then nothing -- a 90-day regimen would
--      silently run out of reminders after a month)
--   3. Real "Consecutive Misses" detection (was: a UI toggle with no
--      backing logic at all)

-- ---------- 1. CHW patient assignment ----------

alter table patients
  add column if not exists assigned_chw_id uuid references profiles(id);

-- ---------- 2. Recurring dose_reminders generator ----------
-- Keeps at least 7 days of reminders ahead for every active prescription
-- (end_date is null or still in the future). Idempotent -- skips any
-- day/time slot that already has a row, so running this daily via cron
-- just extends the window forward instead of duplicating.

create or replace function generate_upcoming_dose_reminders() returns void as $$
declare
  presc record;
  day_offset int;
  slot time;
  dose_time timestamptz;
begin
  for presc in
    select * from prescriptions
    where end_date is null or end_date >= current_date
  loop
    for day_offset in 0 .. 7 loop
      foreach slot in array presc.schedule_times loop
        dose_time := (current_date + day_offset)::date + slot;
        if not exists (
          select 1 from dose_reminders
          where prescription_id = presc.id and scheduled_for = dose_time
        ) then
          insert into dose_reminders (prescription_id, scheduled_for, channel)
          values (presc.id, dose_time, presc.preferred_channel);
        end if;
      end loop;
    end loop;
  end loop;
end;
$$ language plpgsql security definer;

-- ---------- 3. Consecutive Misses detection ----------

alter table escalation_rules
  add column if not exists consecutive_misses_enabled boolean not null default false,
  add column if not exists consecutive_misses_threshold integer not null default 3;

alter table escalations drop constraint if exists escalations_trigger_type_check;
alter table escalations add constraint escalations_trigger_type_check
  check (trigger_type in ('missed_dose', 'missed_appointment', 'consecutive_misses'));

create or replace function check_consecutive_misses() returns void as $$
declare
  rules record;
  presc record;
  recent_confirmed boolean[];
  anchor_dose_id uuid;
begin
  select * into rules from escalation_rules limit 1;
  if not coalesce(rules.consecutive_misses_enabled, false) then
    return; -- rule is toggled off -- respects the actual UI setting now
  end if;

  for presc in select id, patient_id, medication from prescriptions loop
    -- Pull the N most recent due doses for this prescription, most recent first.
    select array_agg(confirmed order by scheduled_for desc)
    into recent_confirmed
    from (
      select confirmed, scheduled_for
      from dose_reminders
      where prescription_id = presc.id and scheduled_for <= now()
      order by scheduled_for desc
      limit rules.consecutive_misses_threshold
    ) recent;

    if array_length(recent_confirmed, 1) = rules.consecutive_misses_threshold
       and not (true = any(recent_confirmed)) then -- every one of the last N is unconfirmed
      select id into anchor_dose_id
      from dose_reminders
      where prescription_id = presc.id and scheduled_for <= now()
      order by scheduled_for desc
      limit 1;

      if not exists (
        select 1 from escalations
        where dose_reminder_id = anchor_dose_id and trigger_type = 'consecutive_misses'
      ) then
        insert into escalations (patient_id, medication, phase, missed_at, status, dose_reminder_id, trigger_type, ai_priority, ai_reasoning)
        values (
          presc.patient_id, presc.medication,
          rules.consecutive_misses_threshold || ' consecutive missed doses',
          now(), 'pending', anchor_dose_id, 'consecutive_misses',
          'high', -- rule-based override: consecutive misses is inherently higher urgency, doesn't need an AI call to know that
          'Missed ' || rules.consecutive_misses_threshold || ' consecutive scheduled doses -- pattern suggests treatment has been abandoned, not a one-off miss.'
        );
      end if;
    end if;
  end loop;
end;
$$ language plpgsql security definer;

-- Schedule both alongside the existing engine functions (safe to re-run;
-- cron.schedule replaces a job of the same name if it already exists).
select cron.schedule('generate-upcoming-dose-reminders', '0 2 * * *', $$select generate_upcoming_dose_reminders()$$);
select cron.schedule('check-consecutive-misses', '*/15 * * * *', $$select check_consecutive_misses()$$);
