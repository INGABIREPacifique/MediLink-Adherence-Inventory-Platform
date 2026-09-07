-- Backs the Conditions & Diagnoses section on PatientMedicalRecord.tsx
-- (nurse) and PatientMedicalRecords.tsx (patient, read-only) -- currently
-- local component state only, lost on refresh.

create table conditions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  name text not null,
  diagnosed_on date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index conditions_patient_id_idx on conditions(patient_id);

alter table conditions enable row level security;

-- Same shape as the patients table's own policies: all staff can read
-- (needed for the patient-portal-mirrors-nurse-record pattern this
-- project uses), only nurse/admin can write.
create policy "All staff read conditions" on conditions
  for select using (auth.role() = 'authenticated');

create policy "Nurse/admin write conditions" on conditions
  for insert with check (current_user_role() = ANY (ARRAY['nurse'::user_role, 'admin'::user_role]));

create policy "Nurse/admin update conditions" on conditions
  for update using (current_user_role() = ANY (ARRAY['nurse'::user_role, 'admin'::user_role]));

create policy "Nurse/admin delete conditions" on conditions
  for delete using (current_user_role() = ANY (ARRAY['nurse'::user_role, 'admin'::user_role]));
