-- CHW visit logging -- matches Figma "CHW Field App - Visit Log" (node
-- 1:1909) and the pilot doc's description of CHWs following up on
-- escalated patients. Previously nothing captured this; visits only
-- existed as a Figma mockup.

create table chw_visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  escalation_id uuid references escalations(id), -- optional link if the visit was in response to an escalation
  logged_by uuid references profiles(id),
  outcome text not null default 'visited', -- 'visited' | 'unreachable' | 'rescheduled'
  notes text,
  visited_at timestamptz not null default now()
);

alter table chw_visits enable row level security;

create policy "Authenticated staff full access to chw_visits" on chw_visits
  for all using (auth.role() = 'authenticated');
