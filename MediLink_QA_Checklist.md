# MediLink Rwanda — QA Checklist

**Status as of this document:** Frontend + backend wired for nearly everything except USSD/Twilio (held per your instruction) and 4 Patient Portal screens (missed, flagged below — my error, not a deliberate deferral).

**Overall progress rating: 7/10.** Strong backend coverage and honest handling of what isn't real yet, but there's a real gap (4 unwired Patient Portal screens) that I reported as "done" when it wasn't, and 8 of 10 Pharmacy Logistics screens are still unverified against actual Figma design (built from structure/memory, not confirmed pixel-for-pixel). Both are listed below so you can verify yourself rather than trust my word.

---

## 0. Before anything else — run this migration

- [ ] **Migration 0024 (`facility_linkage.sql`)** — confirm it ran. *Reason:* this is the most recent migration; if it didn't run, Ministry Sector Reports and Adherence Map will show blank/zero adherence instead of real numbers. *Solves:* real per-sector/per-district adherence instead of a placeholder.

---

## 1. Known gap — fix or acknowledge before calling this "done"

- [ ] **Patient Portal: Dashboard, Adherence, Reports, Settings are still mock.** *Reason:* I wired `PatientMedications` and `PatientMedicalRecords` (the two tied to allergies work) but missed these four — confirmed by grep, not assumption. *Solves:* right now, a patient opening these four tabs sees fake data (hardcoded "October Adherence Summary", a settings form that doesn't save). *Action:* decide if you want these wired next, or if they're lower priority since real patient auth doesn't exist yet either.

---

## 2. Pilot Core (regression check)

*Reason for checking at all: nothing here was touched this session, but many new tables/columns were added to the same database — worth confirming nothing broke.*

- [ ] Log in as nurse, admin, and CHW roles — confirm each still sees the correct sidebar/permissions. **Solves:** role-based access wasn't accidentally widened by new RLS policies.
- [ ] Enroll a new patient with 2+ medications. **Solves:** confirms `enrollPatient` still works after I added `known_allergies` and `facility_id` to the insert.
- [ ] Confirm a dose via the USSD Simulator. **Solves:** confirms `dose_reminders` flow still works after `instructions` column was added.
- [ ] Check the Escalation Inbox still populates. **Solves:** nothing changed here directly, but it's the most-used real feature — worth a sanity check.

---

## 3. Allergies & Medical Records (this session's first feature)

- [ ] Add an allergy on Staff Registration, type a matching medication name, confirm the conflict banner appears and blocks submission until acknowledged. **Reason/Solves:** this is the actual safety feature — verifies a nurse can't silently discharge a patient on a drug they're allergic to.
- [ ] Refresh the page after adding an allergy via `PatientMedicalRecord.tsx` (nurse view) — confirm it's still there. **Solves:** confirms allergies persist to Supabase (migration 0015) instead of vanishing on refresh, which was the original bug this fixed.
- [ ] Check the same patient's allergy shows on `/patient/medications` (Patient Portal). **Solves:** confirms the nurse-writes/patient-reads mirror actually works end to end.
- [ ] Add a Condition/Diagnosis on the nurse Medical Record page, refresh. **Expected: it disappears.** **Reason:** conditions are still local-only (no `conditions` table exists — that's migration 0016, drafted but I should double check if you ran it). **Solves:** tells you whether this needs to move up your priority list.

---

## 4. Reminder Engine

- [ ] Add administration instructions to a medication at enrollment (e.g. "Take with food"), then check the USSD Simulator message for that dose. **Reason/Solves:** verifies the actual feature you asked for — nurses no longer have to manually compose reminder text; confirms it's pulling the real `instructions` column, not a placeholder.
- [ ] Check a patient on 2+ medications gets **distinct** messages per medication, not one blended message. **Solves:** this was explicitly the "must respect each medication separately" requirement from your original ask.

---

## 5. Pharmacy Logistics (8 screens — all wired, fidelity partially unverified)

- [ ] **Order Tracking, Cold Chain Monitor, Thermal Audit Log** — confirm they show the seeded demo shipments/readings (migration 0022) and not an empty state. **Solves:** confirms the read path works.
- [ ] **Delivery Receipt** — walk through the full flow once with a real cold-chain reading that's *within* range, and note the thermal-alert path exists but you likely won't see it trigger unless you manually insert an out-of-range reading. **Reason:** this is the one screen where I found and fixed a real behavioral bug (Confirm button should disable during a thermal alert) — worth specifically testing that path by inserting a bad reading via SQL: `insert into cold_chain_readings (batch_reference, temperature_celsius) values ('Insulin Batch #BX-8903', 12.0);` then reload. **Solves:** confirms nurses can't accidentally accept a spoiled cold-chain shipment.
- [ ] **Replenishment Request → Replenishment Approval** — submit a request, then approve/reject it from the other screen. **Solves:** confirms the two-sided workflow (request → approval) actually connects, not just each screen independently.
- [ ] **Log Medication Usage** (CHW) — log a usage entry, confirm no crash (this pulls the real patient list and real inventory catalogue). **Solves:** confirms CHW field-logging writes to `medication_usage_logs`.
- [ ] ⚠️ **Not yet verified against real Figma:** Log Medication Usage, Usage Recorded Success, Replenishment Request (all 3 screens), Request Status Tracker. **Reason:** Figma's rate limit capped repeatedly; I only got through Incoming Batch, Integrity Check, and Log Discrepancies. **What to check:** exact button copy, field labels, and layout may not match the original design 1:1 even though the functionality is real.

---

## 6. Ministry Tier (11 screens)

- [ ] **Dashboard, Sector Reports, Adherence Map** — confirm these show non-zero numbers after migration 0024. **Reason/Solves:** these three specifically depend on the new `facility_id` linkage; if the migration didn't run, they'll show 0% or blank instead of real adherence.
- [ ] **Report Templates → Report Approval** — generate a report from a template, then find and approve/reject it on the Approval screen. **Solves:** confirms the report lifecycle (draft → pending → approved) actually connects across two screens.
- [ ] **Performance Export → Sign & Approve modal** — generate and sign a report. **Reason:** this button used to be permanently disabled; now it's real. **Solves:** confirms it's not just *appearing* to work — check Report Approval afterward to see the same report with a real approval record.
- [ ] **Supply Chain Correlation** — confirm it shows real current stock levels, and notice the correlation/AI-recommendation section is gone. **Reason:** this was intentionally dropped, not broken — the original mock's "0.78 correlation coefficient" was never a real calculation. **Solves:** tells you whether you want that as a real analytics feature built later, or if honest omission is fine long-term.

---

## 7. Research Portal (2 of 5 screens wired)

- [ ] Submit a request via **Data Access Request**, then look it up on **Researcher Dashboard** using the same email. **Solves:** confirms the submit → lookup loop works. No login exists on this portal by design, so email is the only lookup key — worth deciding if that's acceptable long-term or needs real auth later.
- [ ] **PublicHome / ResearchDataPortal** — these are intentionally static, nothing to test functionally, just visually if you care about them.

---

## 8. CHW Views (4 screens)

- [ ] **Patient Map** — confirm it lists real pending escalations, sorted by priority, with no distance/ETA shown. **Reason:** distance/ETA were deliberately dropped (no real GPS data exists) — confirm that reads as intentional, not broken, in the UI.
- [ ] **Escalation Detail** — open one from Tasks List, confirm the 7-day adherence timeline shows real dose data for that specific patient, and try **Log Visit**. **Solves:** confirms `chw_visits` actually gets a new row — check in Supabase table editor after clicking it.
- [ ] **Supervisor Escalation Dashboard** — confirm "Avg Resolution" and "% Resolved < 24h" show real numbers or "N/A" (not a hardcoded value). **Reason:** these only compute once escalations have actually been resolved in the system — if you have zero resolved escalations, you should see "N/A", not a fake average.

---

## 9. Security / Data Integrity Spot-Checks

*Reason for this section: new tables/policies were added across 6 migrations this session — worth a basic trust-but-verify pass rather than assuming RLS is correct.*

- [ ] Log in as a `chw` role, try to directly approve a Ministry report or reject a replenishment request via the UI. **Expected:** should not be possible / buttons shouldn't be reachable, since RLS restricts those actions to `nurse`/`admin`/`ministry`. **Solves:** confirms role separation wasn't accidentally loosened.
- [ ] Check the **research_data_requests** table allows anonymous insert (submit the Data Access Request form while logged out, if your setup allows it). **Reason:** this table was deliberately designed to allow public/unauthenticated submission — confirm that's actually true and not accidentally blocked or, worse, accidentally open to public *read* too (it should only be open to public *write*).

---

## 10. Still deliberately not built (no action needed, just awareness)

- USSD/Twilio real telecom integration — held per your instruction, you'll pick this up.
- Real patient phone+OTP login — schema prep exists (migration 0021), login flow itself doesn't.
- Real Ministry PKI e-signature — "Sign & Approve" records an audit note, not a cryptographic signature.
- `conditions` table wiring — migration exists (0016), confirm you ran it; UI is only wired if it's there.

---

## How to use this

Work top to bottom. Sections 0–1 are the highest priority (things I know are incomplete or need your confirmation). Sections 2–8 are functional verification, one section per feature area. Section 9 is a trust check on data security. Section 10 is just so nothing on this list surprises you later.
