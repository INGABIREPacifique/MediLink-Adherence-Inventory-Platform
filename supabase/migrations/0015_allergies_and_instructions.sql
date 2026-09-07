-- Backs the two frontend-first features already built and pushed
-- (Staff Registration allergy capture + conflict check, and per-medication
-- reminder instructions in the USSD Simulator / enrollment form), neither
-- of which had a real column to write to yet -- both were UI-only,
-- flagged in code comments as pending this migration.
--
-- No new RLS policies needed: these are new columns on tables that
-- already have working policies (patients: nurse/admin write+update,
-- all-staff read; prescriptions: nurse/admin write, all-staff read).
-- Column-level access follows the existing table-level policy.

-- ---------- 1. Allergies on patients ----------

alter table patients
  add column known_allergies text[] not null default '{}';

comment on column patients.known_allergies is
  'Captured at enrollment (Staff Registration) or later via the Medical Record page. Checked against new prescriptions.medication at enrollment time in the frontend (name/substring match, not a full drug-interaction check). Read-only in the Patient Portal.';

-- ---------- 2. Per-medication administration instructions ----------

alter table prescriptions
  add column instructions text;

comment on column prescriptions.instructions is
  'Free-text administration guidance (e.g. "Take on an empty stomach, at least 1 hour before food"), captured per medication at enrollment. Composed into USSD/IVR/SMS reminder messages alongside dosage and time-of-day. Nullable: older prescriptions predate this field and simply omit it from the reminder message rather than showing a placeholder.';
