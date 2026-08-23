-- Tightens RLS from "any authenticated staff sees/edits everything" to
-- actual role-based access, per proposal §10's own risk mitigation
-- ("role-based access, encryption, and alignment with Rwanda's data
-- protection regulations"). Previously every policy just checked
-- auth.role() = 'authenticated' -- true for nurse, CHW, and admin alike,
-- which technically satisfied "must be logged in" but not "role-based."

create or replace function current_user_role() returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql stable security definer;

-- ---------- Nurse/admin-only tables (CHWs never touch these screens) ----------

drop policy if exists "Authenticated staff full access to escalation_rules" on escalation_rules;
create policy "Nurse/admin manage escalation_rules" on escalation_rules
  for all using (current_user_role() in ('nurse', 'admin'));

drop policy if exists "Authenticated staff full access to shift_handovers" on shift_handovers;
create policy "Nurse/admin manage shift_handovers" on shift_handovers
  for all using (current_user_role() in ('nurse', 'admin'));

drop policy if exists "Authenticated staff full access to inventory_items" on inventory_items;
create policy "All staff read inventory_items" on inventory_items
  for select using (auth.role() = 'authenticated');
create policy "Nurse/admin write inventory_items" on inventory_items
  for insert with check (current_user_role() in ('nurse', 'admin'));
create policy "Nurse/admin update inventory_items" on inventory_items
  for update using (current_user_role() in ('nurse', 'admin'));

drop policy if exists "Authenticated staff full access to stock_movements" on stock_movements;
create policy "All staff read stock_movements" on stock_movements
  for select using (auth.role() = 'authenticated');
create policy "Nurse/admin write stock_movements" on stock_movements
  for insert with check (current_user_role() in ('nurse', 'admin'));

-- ---------- Enrollment tables: read broadly, write nurse/admin only ----------
-- (StaffRegistration -- where prescriptions/dose_reminders/appointments are
-- created -- isn't in the CHW nav, so CHWs never need to write these.)

drop policy if exists "Authenticated staff full access to patients" on patients;
create policy "All staff read patients" on patients
  for select using (auth.role() = 'authenticated');
create policy "Nurse/admin write patients" on patients
  for insert with check (current_user_role() in ('nurse', 'admin'));
create policy "Nurse/admin update patients" on patients
  for update using (current_user_role() in ('nurse', 'admin'));

drop policy if exists "Authenticated staff full access to prescriptions" on prescriptions;
create policy "All staff read prescriptions" on prescriptions
  for select using (auth.role() = 'authenticated');
create policy "Nurse/admin write prescriptions" on prescriptions
  for insert with check (current_user_role() in ('nurse', 'admin'));

drop policy if exists "Authenticated staff full access to dose_reminders" on dose_reminders;
create policy "All staff read dose_reminders" on dose_reminders
  for select using (auth.role() = 'authenticated');
create policy "Nurse/admin insert dose_reminders" on dose_reminders
  for insert with check (current_user_role() in ('nurse', 'admin'));
-- UPDATE (confirming a dose) stays open to nurse+CHW -- both roles have
-- the USSD Simulator, which confirms doses.
create policy "All staff confirm dose_reminders" on dose_reminders
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated staff full access to appointments" on appointments;
create policy "All staff read appointments" on appointments
  for select using (auth.role() = 'authenticated');
create policy "Nurse/admin insert appointments" on appointments
  for insert with check (current_user_role() in ('nurse', 'admin'));
create policy "All staff confirm appointments" on appointments
  for update using (auth.role() = 'authenticated'); -- USSD Simulator confirm, both roles

-- ---------- Escalations: read broadly (CHW Home needs this), write nurse/admin ----------

drop policy if exists "Authenticated staff full access to escalations" on escalations;
create policy "All staff read escalations" on escalations
  for select using (auth.role() = 'authenticated');
create policy "Nurse/admin update escalations" on escalations
  for update using (current_user_role() in ('nurse', 'admin'));
-- INSERT is normally done by the security-definer engine functions
-- (check_missed_doses etc.), which run with elevated privilege and bypass
-- this -- but allow nurse/admin manual inserts too, for flexibility.
create policy "Nurse/admin insert escalations" on escalations
  for insert with check (current_user_role() in ('nurse', 'admin'));

drop policy if exists "Authenticated staff full access to follow_up_logs" on follow_up_logs;
create policy "All staff read follow_up_logs" on follow_up_logs
  for select using (auth.role() = 'authenticated');
create policy "Nurse/admin write follow_up_logs" on follow_up_logs
  for insert with check (current_user_role() in ('nurse', 'admin'));

-- chw_visits stays open to nurse+CHW+admin -- genuinely used by both roles.
-- profiles: allow admins to see every profile (useful for role management),
-- everyone else still only their own.
drop policy if exists "Authenticated staff read own profile" on profiles;
create policy "Staff read own profile or admin reads all" on profiles
  for select using (auth.uid() = id or current_user_role() = 'admin');
