-- Demo data for the 4 Ministry screens wired in this pass, matching the
-- existing seed-migration pattern.

insert into facilities (name, facility_type, district, sector)
values
  ('Kigali Central Hospital', 'Referral', 'Gasabo', 'Kimironko'),
  ('Nyarugenge District Hospital', 'District', 'Nyarugenge', 'Nyamirambo'),
  ('Remera Health Center', 'Primary', 'Gasabo', 'Remera');

insert into report_templates (name, description, fields)
values
  ('National Health Board Summary', 'Adherence and clinical performance metrics.', '[{"label":"Adherence Rate"},{"label":"Escalation Count"},{"label":"Stock Status"}]'::jsonb);

insert into ministry_reports (title, template_id, facility_id, status)
select
  'Q3 Pilot Adherence Review',
  (select id from report_templates where name = 'National Health Board Summary'),
  (select id from facilities where name = 'Kigali Central Hospital'),
  'pending_review';
