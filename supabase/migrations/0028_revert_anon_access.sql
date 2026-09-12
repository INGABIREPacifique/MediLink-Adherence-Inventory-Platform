-- Reverses 0027_open_staff_portal_anon_access.sql (removed from the repo
-- since the open-access approach was reconsidered in favor of real
-- self-service signup instead -- see StaffSignup.tsx). Safe to run
-- whether or not 0027 was ever actually applied: `drop policy if exists`
-- does nothing if the policy was never created.

drop policy if exists "Anon full access to patients" on patients;
drop policy if exists "Anon full access to prescriptions" on prescriptions;
drop policy if exists "Anon full access to appointments" on appointments;
drop policy if exists "Anon full access to escalations" on escalations;
drop policy if exists "Anon full access to follow_up_logs" on follow_up_logs;
drop policy if exists "Anon full access to inventory_items" on inventory_items;
drop policy if exists "Anon full access to stock_movements" on stock_movements;
drop policy if exists "Anon full access to escalation_rules" on escalation_rules;
drop policy if exists "Anon full access to shift_handovers" on shift_handovers;
drop policy if exists "Anon full access to dose_reminders" on dose_reminders;
drop policy if exists "Anon full access to chw_visits" on chw_visits;
drop policy if exists "Anon full access to profiles" on profiles;
drop policy if exists "Anon full access to pilot_feedback" on pilot_feedback;
drop policy if exists "Anon full access to chw_training_progress" on chw_training_progress;
drop policy if exists "Anon full access to conditions" on conditions;
drop policy if exists "Anon full access to shipments" on shipments;
drop policy if exists "Anon full access to cold_chain_readings" on cold_chain_readings;
drop policy if exists "Anon full access to deliveries" on deliveries;
drop policy if exists "Anon full access to replenishment_requests" on replenishment_requests;
drop policy if exists "Anon full access to replenishment_request_items" on replenishment_request_items;
drop policy if exists "Anon full access to medication_usage_logs" on medication_usage_logs;
drop policy if exists "Anon full access to facilities" on facilities;
drop policy if exists "Anon full access to report_templates" on report_templates;
drop policy if exists "Anon full access to ministry_reports" on ministry_reports;
drop policy if exists "Anon full access to report_approvals" on report_approvals;
