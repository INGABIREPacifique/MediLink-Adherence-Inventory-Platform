-- Backs the 11 mock Ministry-tier screens (src/pages/ministry/*):
-- Dashboard, Clinical Follow-Up, Sector Reports, National Export,
-- Report Approval + Digital Signature, District Facility, Report
-- Templates, Sector Detail, Adherence Map, Supply Chain Correlation,
-- Performance Export. All 11 currently render from local mock arrays.
--
-- Adherence Map and Supply Chain Correlation don't get their own tables:
-- both are aggregation views over patients/dose_reminders/inventory_items
-- grouped by facility/sector, same "no fake geodata, real query instead"
-- reasoning already applied to the CHW Patient Map screen. National
-- Export and Performance Export are just filtered exports of
-- ministry_reports below, not separate tables either.

create table facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  facility_type text, -- e.g. Referral, District, Specialized, Primary -- matches MinistryDistrictFacility.tsx mock
  district text,
  sector text,
  created_at timestamptz not null default now()
);

-- profiles.facility_id already exists (see 0001_init.sql) but was never
-- backed by a real facilities table until now -- add the FK now that one
-- exists. Not enforced with NOT NULL since existing profiles rows may
-- have this null or pointing at nothing.
alter table profiles
  add constraint profiles_facility_id_fkey foreign key (facility_id) references facilities(id);

create table report_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  fields jsonb not null default '[]', -- field definitions the template expects, kept flexible rather than a rigid schema per template
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table ministry_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  template_id uuid references report_templates(id),
  facility_id uuid references facilities(id), -- null for national-level reports
  requested_by uuid references profiles(id),
  period_start date,
  period_end date,
  status text not null default 'draft', -- draft | pending_review | in_review | approved | rejected
  data jsonb, -- the generated report payload/snapshot
  created_at timestamptz not null default now()
);

create index ministry_reports_facility_id_idx on ministry_reports(facility_id);
create index ministry_reports_status_idx on ministry_reports(status);

create table report_approvals (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references ministry_reports(id) on delete cascade,
  approver_id uuid references profiles(id),
  decision text not null, -- approved | rejected | changes_requested
  signature_note text, -- e.g. "Digitally signed by Dr. X, DG Health Systems" -- a real e-signature/PKI integration is a bigger decision the original doc already flagged as deferred; this records intent/audit trail, not cryptographic proof
  decided_at timestamptz not null default now()
);

create index report_approvals_report_id_idx on report_approvals(report_id);

-- ---------- RLS ----------
-- Ministry role sees everything (their whole point is oversight across
-- facilities) but cannot directly edit patient-level clinical data --
-- only report/approval records. Nurse/admin manage facilities and
-- templates (facility-side setup); ministry role manages reports/approvals.

alter table facilities enable row level security;
alter table report_templates enable row level security;
alter table ministry_reports enable row level security;
alter table report_approvals enable row level security;

create policy "All staff read facilities" on facilities for select using (auth.role() = 'authenticated');
create policy "Nurse/admin manage facilities" on facilities for all using (current_user_role() = ANY (ARRAY['nurse'::user_role, 'admin'::user_role]));

create policy "All staff read report_templates" on report_templates for select using (auth.role() = 'authenticated');
create policy "Ministry/admin manage report_templates" on report_templates for all using (current_user_role() = ANY (ARRAY['ministry'::user_role, 'admin'::user_role]));

create policy "All staff read ministry_reports" on ministry_reports for select using (auth.role() = 'authenticated');
create policy "Ministry/nurse/admin write ministry_reports" on ministry_reports for insert with check (current_user_role() = ANY (ARRAY['ministry'::user_role, 'nurse'::user_role, 'admin'::user_role]));
create policy "Ministry/admin update ministry_reports" on ministry_reports for update using (current_user_role() = ANY (ARRAY['ministry'::user_role, 'admin'::user_role]));

create policy "All staff read report_approvals" on report_approvals for select using (auth.role() = 'authenticated');
create policy "Ministry/admin insert report_approvals" on report_approvals for insert with check (current_user_role() = ANY (ARRAY['ministry'::user_role, 'admin'::user_role]));
