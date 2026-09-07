-- Schema prep only -- this does NOT implement phone+OTP login. It adds
-- the column and policy that a real patient auth flow will need once
-- built, so that decision (flagged in the original handoff doc as
-- deferred) can be implemented without another migration later. Until a
-- real login flow sets auth_user_id, all Patient Portal pages keep using
-- the DEMO_PATIENT_ID pattern already in the code.

alter table patients
  add column auth_user_id uuid references auth.users(id) unique;

comment on column patients.auth_user_id is
  'Set once a patient completes phone+OTP verification and is linked to a Supabase auth user. Null for all patients until that login flow is built. Enables the self-read policy below.';

-- Lets a logged-in patient read their own row directly, once
-- auth_user_id is set -- this is what makes the Patient Portal gate-able
-- by real login instead of an open URL. Existing "All staff read
-- patients" policy is unaffected; this adds an additional path, it
-- doesn't replace staff access.
create policy "Patients read own record" on patients
  for select using (auth_user_id = auth.uid());

-- Same pattern extended to the two tables the Patient Portal reads for a
-- patient's own data: their prescriptions and their own conditions.
create policy "Patients read own prescriptions" on prescriptions
  for select using (
    patient_id in (select id from patients where auth_user_id = auth.uid())
  );

create policy "Patients read own conditions" on conditions
  for select using (
    patient_id in (select id from patients where auth_user_id = auth.uid())
  );
