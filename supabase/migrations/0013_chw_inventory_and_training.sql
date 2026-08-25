-- Two fixes:
--   1. CHWs need to log usage against the same inventory_items table
--      (their field supply kit is drawn from the same facility stock, per
--      this pilot's single-facility scope) -- but 0009_role_based_rls.sql
--      restricted inventory writes to nurse/admin only, since at the time
--      no CHW screen needed it. The Local Inventory screen changes that.
--   2. Real training progress tracking for CHW onboarding.

drop policy if exists "Nurse/admin write inventory_items" on inventory_items;
create policy "Nurse/admin insert inventory_items" on inventory_items
  for insert with check (current_user_role() in ('nurse', 'admin'));
-- UPDATE (logging usage) now open to nurse+CHW+admin -- both roles log
-- stock changes, just from different screens (Ward Inventory vs Local
-- Inventory), against the same underlying stock.
drop policy if exists "Nurse/admin update inventory_items" on inventory_items;
create policy "All staff update inventory_items" on inventory_items
  for update using (auth.role() = 'authenticated');

drop policy if exists "Nurse/admin write stock_movements" on stock_movements;
create policy "All staff write stock_movements" on stock_movements
  for insert with check (auth.role() = 'authenticated');

create table chw_training_progress (
  id uuid primary key default gen_random_uuid(),
  chw_id uuid not null references profiles(id) on delete cascade,
  module_key text not null,
  completed_at timestamptz not null default now(),
  unique (chw_id, module_key)
);

alter table chw_training_progress enable row level security;

create policy "Staff read own training progress or admin reads all" on chw_training_progress
  for select using (chw_id = auth.uid() or current_user_role() in ('nurse', 'admin'));
create policy "CHW completes own training modules" on chw_training_progress
  for insert with check (chw_id = auth.uid());
