-- Makes the staff/CHW portal genuinely open (no login required), the
-- way Patient/Ministry/Public already are. The previous attempt only
-- changed frontend routing, which didn't work: every table below is
-- protected by RLS requiring a real authenticated Supabase session, so
-- an unauthenticated visitor's requests were silently blocked by the
-- database even though the page itself loaded -- everything just
-- appeared empty. This is the actual fix, at the layer where access is
-- really enforced.
--
-- Each statement below ADDS a new permissive policy scoped specifically
-- to the `anon` role -- it does not touch, replace, or weaken any
-- existing "authenticated" policy. Postgres RLS policies for the same
-- command are OR'd together, so real staff logins keep working exactly
-- as before; this only adds an additional door for anonymous access.
--
-- Explicit tradeoff, stated plainly: this means anyone with the link can
-- read and write this data with no login and no attribution of who did
-- what. That's the same tradeoff already accepted for Patient Portal /
-- Ministry / Public Research -- this migration just makes it true for
-- the remaining tables too, per explicit request.

create policy "Anon full access to patients" on patients for all to anon using (true) with check (true);
create policy "Anon full access to prescriptions" on prescriptions for all to anon using (true) with check (true);
create policy "Anon full access to appointments" on appointments for all to anon using (true) with check (true);
create policy "Anon full access to escalations" on escalations for all to anon using (true) with check (true);
create policy "Anon full access to follow_up_logs" on follow_up_logs for all to anon using (true) with check (true);
create policy "Anon full access to inventory_items" on inventory_items for all to anon using (true) with check (true);
create policy "Anon full access to stock_movements" on stock_movements for all to anon using (true) with check (true);
create policy "Anon full access to escalation_rules" on escalation_rules for all to anon using (true) with check (true);
create policy "Anon full access to shift_handovers" on shift_handovers for all to anon using (true) with check (true);
create policy "Anon full access to dose_reminders" on dose_reminders for all to anon using (true) with check (true);
create policy "Anon full access to chw_visits" on chw_visits for all to anon using (true) with check (true);
create policy "Anon full access to profiles" on profiles for all to anon using (true) with check (true);
create policy "Anon full access to pilot_feedback" on pilot_feedback for all to anon using (true) with check (true);
create policy "Anon full access to chw_training_progress" on chw_training_progress for all to anon using (true) with check (true);
create policy "Anon full access to conditions" on conditions for all to anon using (true) with check (true);
create policy "Anon full access to shipments" on shipments for all to anon using (true) with check (true);
create policy "Anon full access to cold_chain_readings" on cold_chain_readings for all to anon using (true) with check (true);
create policy "Anon full access to deliveries" on deliveries for all to anon using (true) with check (true);
create policy "Anon full access to replenishment_requests" on replenishment_requests for all to anon using (true) with check (true);
create policy "Anon full access to replenishment_request_items" on replenishment_request_items for all to anon using (true) with check (true);
create policy "Anon full access to medication_usage_logs" on medication_usage_logs for all to anon using (true) with check (true);
create policy "Anon full access to facilities" on facilities for all to anon using (true) with check (true);
create policy "Anon full access to report_templates" on report_templates for all to anon using (true) with check (true);
create policy "Anon full access to ministry_reports" on ministry_reports for all to anon using (true) with check (true);
create policy "Anon full access to report_approvals" on report_approvals for all to anon using (true) with check (true);
