-- Real dose-history seed data. Generates actual scheduled dose rows for the
-- last 30 days per seeded patient (matching their prescriptions), with
-- realistic confirm/miss patterns -- so adherence rate, the 7-day trend,
-- and the discharge summary are all computed from real rows, not proxies
-- or hardcoded percentages.

insert into prescriptions (patient_id, medication, dosage, times_per_day, schedule_times, start_date, preferred_channel, language) values
  ('11111111-1111-1111-1111-111111111111', 'Rifampicin/Isoniazid', '150mg/75mg', 2, '{08:00,20:00}', current_date - 30, 'ussd', 'rw'),
  ('22222222-2222-2222-2222-222222222222', 'Ethambutol', '400mg', 2, '{08:00,20:00}', current_date - 20, 'ussd', 'rw'),
  ('33333333-3333-3333-3333-333333333333', 'Pyrazinamide', '500mg', 2, '{08:00,20:00}', current_date - 15, 'ussd', 'rw'),
  ('44444444-4444-4444-4444-444444444444', 'Rifampicin', '600mg', 1, '{08:00}', current_date - 30, 'ussd', 'rw');

-- Generate dose history for each prescription: one row per scheduled dose
-- time per day since start_date, confirmed with ~90% probability except
-- for the most recent scheduled dose on patients with an active escalation
-- (patients 1-3), which stays unconfirmed to match the seeded escalation.
do $$
declare
  presc record;
  day_offset int;
  slot time;
  dose_time timestamptz;
  is_most_recent boolean;
  should_confirm boolean;
begin
  for presc in select * from prescriptions loop
    for day_offset in 0 .. (current_date - presc.start_date) loop
      foreach slot in array presc.schedule_times loop
        dose_time := (presc.start_date + day_offset)::date + slot;
        if dose_time > now() then
          continue;
        end if;

        is_most_recent := (dose_time = (
          select max((presc.start_date + d)::date + s)
          from generate_series(0, current_date - presc.start_date) d, unnest(presc.schedule_times) s
          where (presc.start_date + d)::date + s <= now()
        ));

        -- Patients 1-3 have an active unresolved escalation seeded in
        -- 0003_seed_demo_data.sql -- keep their most recent dose unconfirmed
        -- so this table agrees with that escalation instead of contradicting it.
        if is_most_recent and presc.patient_id in (
          '11111111-1111-1111-1111-111111111111',
          '22222222-2222-2222-2222-222222222222',
          '33333333-3333-3333-3333-333333333333'
        ) then
          should_confirm := false;
        else
          should_confirm := random() < 0.90;
        end if;

        insert into dose_reminders (prescription_id, scheduled_for, channel, confirmed, confirmed_at)
        values (
          presc.id,
          dose_time,
          presc.preferred_channel,
          should_confirm,
          case when should_confirm then dose_time + (random() * interval '20 minutes') else null end
        );
      end loop;
    end loop;
  end loop;
end $$;
