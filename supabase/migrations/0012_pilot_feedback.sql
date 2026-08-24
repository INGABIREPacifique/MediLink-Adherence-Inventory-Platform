-- Real pilot feedback collection -- matches the Figma "Pilot Feedback &
-- Iteration Log" screen, which is explicitly named for the 3-month pilot
-- period itself, not a later-phase feature. Nothing collected structured
-- feedback before this.

create table pilot_feedback (
  id uuid primary key default gen_random_uuid(),
  reported_by uuid references profiles(id),
  category text not null default 'workflow_friction' -- 'workflow_friction' | 'system_bug' | 'feature_request'
    check (category in ('workflow_friction', 'system_bug', 'feature_request')),
  description text not null,
  status text not null default 'under_review' -- 'under_review' | 'planned' | 'resolved'
    check (status in ('under_review', 'planned', 'resolved')),
  created_at timestamptz not null default now()
);

alter table pilot_feedback enable row level security;

create policy "Authenticated staff full access to pilot_feedback" on pilot_feedback
  for all using (auth.role() = 'authenticated');
