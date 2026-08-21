-- Demo seed data -- matches the numbers shown in the Figma reference
-- screenshots so the pilot demo looks identical to the design once wired
-- to real Supabase data instead of mock services.

insert into patients (id, name, phone) values
  ('11111111-1111-1111-1111-111111111111', 'Jean-Baptiste Mugisha', '+250 788 123 456'),
  ('22222222-2222-2222-2222-222222222222', 'Aline Uwimana', '+250 782 987 654'),
  ('33333333-3333-3333-3333-333333333333', 'Emmanuel Nsengiyumva', '+250 783 444 555'),
  ('44444444-4444-4444-4444-444444444444', 'Chantal Iribagiza', '+250 781 222 333');

insert into escalations (patient_id, medication, phase, missed_at, status, resolved_at, ai_priority, ai_reasoning) values
  ('11111111-1111-1111-1111-111111111111', 'Rifampicin/Isoniazid', 'Phase 1 (Intensive)', now() - interval '6 hours 45 minutes', 'pending', null, 'high', 'TB treatment -- missed dose in intensive phase carries higher relapse risk.'),
  ('22222222-2222-2222-2222-222222222222', 'Ethambutol', 'Phase 2 (Continuation)', now() - interval '4 hours 20 minutes', 'in_progress', null, 'medium', 'Continuation phase, lower acute risk, still needs same-day follow-up.'),
  ('33333333-3333-3333-3333-333333333333', 'Pyrazinamide', 'Phase 1 (Intensive)', now() - interval '5 hours 10 minutes', 'pending', null, 'high', 'Second missed dose this week -- escalate contact priority.'),
  ('44444444-4444-4444-4444-444444444444', 'Rifampicin', 'Phase 1 (Intensive)', now() - interval '1 day', 'resolved', now() - interval '20 hours', 'low', 'Confirmed taken late; no further action needed.');

insert into inventory_items (name, form, unit, current_stock, reorder_threshold, status, expires_on) values
  ('Amoxicillin 500mg', 'Capsule, Blister Pack', 'Boxes', 12, 30, 'critical', current_date + interval '210 days'),
  ('Paracetamol 1g', 'Tablet, Bottle', 'Bottles', 45, 40, 'warning', current_date + interval '45 days'),
  ('Rifampicin/Isoniazid', 'Tablet, Blister Pack', 'Boxes', 120, 30, 'healthy', current_date + interval '300 days'),
  ('Ethambutol', 'Tablet, Bottle', 'Bottles', 60, 25, 'healthy', current_date + interval '180 days'),
  ('Ceftriaxone 1g', 'Vial for Injection', 'Vials', 8, 15, 'critical', current_date + interval '90 days'),
  ('IV Fluids (Saline 0.9%)', 'Bags (500ml)', 'Bags', 42, 100, 'critical', current_date + interval '365 days');
