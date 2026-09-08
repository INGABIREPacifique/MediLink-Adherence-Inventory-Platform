-- Demo data for the Pharmacy Logistics screens wired in this pass, so
-- Order Tracking / Cold Chain Monitor / Thermal Audit Log / Delivery
-- Receipt aren't just empty states on first load. Matches the existing
-- seed-migration pattern (0003_seed_demo_data.sql, 0005, 0008).

insert into shipments (reference, origin, destination, status, dispatched_at, eta)
values
  ('SHP-4821', 'Kigali Central', 'Musanze', 'in_transit', now() - interval '3 hours', now() + interval '2 hours 15 minutes'),
  ('SHP-4809', 'Kigali Central', 'Nyagatare', 'delivered', now() - interval '2 days', null),
  ('SHP-4790', 'Musanze', 'Health Post 4', 'delayed', now() - interval '6 hours', now() + interval '4 hours 30 minutes');

insert into cold_chain_readings (shipment_id, temperature_celsius, recorded_at)
select id, 4.2, now() - interval '1 hour' from shipments where reference = 'SHP-4821'
union all
select id, 8.4, now() - interval '2 hours' from shipments where reference = 'SHP-4809'
union all
select id, 3.8, now() - interval '30 minutes' from shipments where reference = 'SHP-4790';

insert into cold_chain_readings (batch_reference, temperature_celsius, recorded_at)
values
  ('Insulin Batch #BX-8903', 4.2, now() - interval '4 hours'),
  ('Malaria RDT #MR-001X', 22.1, now() - interval '1 day');

insert into deliveries (batch_reference, source_hub, expected_quantity, driver_name, dispatched_at, status)
values
  ('Insulin Batch #BX-8903', 'Kigali Central Medical Stores', 250, 'Jean-Paul Ndoli', now() - interval '1 hour', 'pending');
