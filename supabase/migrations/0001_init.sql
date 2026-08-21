-- MediLink Rwanda -- Pilot schema
-- Kigali Central Hospital, Internal Medicine ward, per MediLink_Rwanda.docx.
-- Matches the TypeScript types in src/types/index.ts exactly so the
-- supabase-backed services can be typed 1:1 against these tables.

create type user_role as enum ('nurse', 'chw', 'admin');
create type alert_status as enum ('pending', 'in_progress', 'resolved');
create type stock_status as enum ('healthy', 'adequate', 'warning', 'critical');
create type ai_priority as enum ('low', 'medium', 'high', 'critical');
create type follow_up_method as enum ('phone', 'in_person', 'sms');
create type follow_up_outcome as enum ('confirmed_taken', 'confirmed_missed', 'unreachable', 'rescheduled');

-- ---------- Identity ----------
-- Extends Supabase's built-in auth.users. This is what the GreetingBanner /
-- Sidebar will read from once auth is wired, replacing the hardcoded
-- "Uwase" placeholder.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'nurse',
  facility_id uuid, -- references facilities(id) once multi-facility is needed; single-facility for pilot
  created_at timestamptz not null default now()
);

-- ---------- Patients & prescriptions ----------
create table patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  enrolled_by uuid references profiles(id),
  enrolled_at timestamptz not null default now()
);

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  medication text not null,
  dosage text,
  times_per_day integer not null default 1,
  schedule_times time[] not null default '{}',
  start_date date not null default current_date,
  end_date date,
  preferred_channel text not null default 'ussd', -- 'ussd' | 'ivr' | 'sms'
  language text not null default 'rw',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  scheduled_for date not null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

-- ---------- Escalations (maps 1:1 to EscalationAlert type) ----------
create table escalations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  medication text not null,
  phase text,
  missed_at timestamptz not null default now(),
  status alert_status not null default 'pending',
  resolved_at timestamptz,
  resolution_note text,
  -- AI-assisted priority ranking, per proposal §4 -- the trigger stays
  -- rule-based (a timer), only this ranking is AI-assisted.
  ai_priority ai_priority,
  ai_reasoning text,
  created_at timestamptz not null default now()
);

create table follow_up_logs (
  id uuid primary key default gen_random_uuid(),
  escalation_id uuid not null references escalations(id) on delete cascade,
  logged_by text not null,
  method follow_up_method not null,
  outcome follow_up_outcome not null,
  notes text,
  logged_at timestamptz not null default now()
);

-- ---------- Ward inventory (maps 1:1 to InventoryItem type) ----------
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  form text,
  unit text not null,
  current_stock integer not null default 0,
  reorder_threshold integer not null default 0, -- rule-based baseline, per proposal §4
  status stock_status not null default 'healthy',
  expires_on date,
  last_logged_at timestamptz not null default now()
);

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  delta integer not null,
  logged_by uuid references profiles(id),
  logged_at timestamptz not null default now()
);

-- ---------- Escalation rules (configurable, per MVP Escalation Rules Configuration screen) ----------
create table escalation_rules (
  id uuid primary key default gen_random_uuid(),
  missed_dose_window_minutes integer not null default 240, -- 4h default, per pilot doc
  second_reminder_delay_minutes integer not null default 60,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);
insert into escalation_rules (missed_dose_window_minutes, second_reminder_delay_minutes)
  values (240, 60);

-- ---------- Shift handovers ----------
create table shift_handovers (
  id uuid primary key default gen_random_uuid(),
  outgoing_nurse text not null,
  incoming_nurse text not null,
  pending_escalations_count integer not null default 0,
  low_stock_items_count integer not null default 0,
  notes text,
  acknowledged boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
-- Single-facility pilot: any authenticated staff member (nurse/chw/admin)
-- can read and write ward data. This is intentionally permissive for the
-- 3-month, one-ward pilot -- tighten to per-facility scoping (like the
-- earlier full-platform schema) before Phase 3 multi-facility expansion.

alter table profiles enable row level security;
alter table patients enable row level security;
alter table prescriptions enable row level security;
alter table appointments enable row level security;
alter table escalations enable row level security;
alter table follow_up_logs enable row level security;
alter table inventory_items enable row level security;
alter table stock_movements enable row level security;
alter table escalation_rules enable row level security;
alter table shift_handovers enable row level security;

create policy "Authenticated staff read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Authenticated staff full access to patients" on patients
  for all using (auth.role() = 'authenticated');

create policy "Authenticated staff full access to prescriptions" on prescriptions
  for all using (auth.role() = 'authenticated');

create policy "Authenticated staff full access to appointments" on appointments
  for all using (auth.role() = 'authenticated');

create policy "Authenticated staff full access to escalations" on escalations
  for all using (auth.role() = 'authenticated');

create policy "Authenticated staff full access to follow_up_logs" on follow_up_logs
  for all using (auth.role() = 'authenticated');

create policy "Authenticated staff full access to inventory_items" on inventory_items
  for all using (auth.role() = 'authenticated');

create policy "Authenticated staff full access to stock_movements" on stock_movements
  for all using (auth.role() = 'authenticated');

create policy "Authenticated staff full access to escalation_rules" on escalation_rules
  for all using (auth.role() = 'authenticated');

create policy "Authenticated staff full access to shift_handovers" on shift_handovers
  for all using (auth.role() = 'authenticated');

-- ---------- Auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'nurse');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
