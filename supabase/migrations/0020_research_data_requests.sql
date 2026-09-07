-- Backs the 5 mock Public/Research Portal screens (src/pages/public/*):
-- Home, Research Data Portal, Data Access Request, Researcher Dashboard,
-- Request Submitted. Home and Research Data Portal are static/browse
-- content, no table needed; Data Access Request -> Request Submitted is
-- one form flow, and Researcher Dashboard lists a researcher's own past
-- requests -- both need this single table.

create table research_data_requests (
  id uuid primary key default gen_random_uuid(),
  researcher_name text not null,
  email text not null,
  institution text,
  purpose text not null,
  dataset_requested text not null, -- e.g. "De-identified adherence trends, Kigali Sector, 2024"
  status text not null default 'submitted', -- submitted | under_review | approved | rejected
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  decision_note text
);

create index research_data_requests_email_idx on research_data_requests(email);

alter table research_data_requests enable row level security;

-- This form is reachable by unauthenticated members of the public (per
-- the doc: Public/Research Portal has "no real authentication" by
-- design) -- so unlike every other table in this project, insert is open
-- to anon, not staff-only. Reading/reviewing existing requests is still
-- staff-only (ministry/admin), since request contents may include
-- researcher contact details.
create policy "Anyone can submit a research data request" on research_data_requests
  for insert with check (true);

create policy "Ministry/admin read research_data_requests" on research_data_requests
  for select using (current_user_role() = ANY (ARRAY['ministry'::user_role, 'admin'::user_role]));

create policy "Ministry/admin review research_data_requests" on research_data_requests
  for update using (current_user_role() = ANY (ARRAY['ministry'::user_role, 'admin'::user_role]));
