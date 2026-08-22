-- Real dose-level adherence tracking. Without this table, "adherence rate"
-- was only a proxy computed from escalation counts -- this is the actual
-- ground truth the proposal describes: every scheduled USSD dose reminder
-- and whether the patient confirmed it, at home, post-discharge.
--
-- IMPORTANT SCOPE NOTE: every patient/dose tracked here is a DISCHARGED
-- patient being monitored remotely (USSD/IVR/SMS from home), not an
-- inpatient. There is no "bed number" or ward-shift concept anywhere in
-- this data model -- that would be a different, inpatient system.

create table dose_reminders (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references prescriptions(id) on delete cascade,
  scheduled_for timestamptz not null,
  channel text not null default 'ussd', -- 'ussd' | 'ivr' | 'sms'
  confirmed boolean not null default false,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table dose_reminders enable row level security;

create policy "Authenticated staff full access to dose_reminders" on dose_reminders
  for all using (auth.role() = 'authenticated');
