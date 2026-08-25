# MediLink Rwanda — Pilot MVP

Web dashboard for the MediLink Rwanda pilot: **post-discharge** medication
adherence escalation and hospital ward inventory management for hospital
staff.

**Important scope note:** every patient tracked in this system has already
been **discharged** and is being monitored remotely from home via USSD/IVR/
SMS dose confirmations — this is not an inpatient ward-management system.
There are no bed numbers or bedside-shift concepts anywhere in the data
model. "Shift Handover" refers to staff handing over pending post-discharge
follow-up work (unresolved escalations, low stock), not inpatient bedside
duties. Ward Inventory is the one legitimately hospital-side module — it
tracks the facility's own drug stock, separate from patient monitoring.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4**
- **react-router-dom** for client-side routing
- **lucide-react** for icons
- Data layer abstracted behind `src/services/` — all five domains (alerts,
  inventory, rules, handover, performance) are wired to real Supabase
  tables, including real dose-level adherence data (`dose_reminders`) for
  the performance report and discharge summary — not proxies. Mock
  implementations still exist for offline dev/testing.

## Getting started

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`.

```bash
npm run build   # production build to dist/
npm run preview # preview the production build locally
```

## Supabase setup (required — auth is now real, app won't load without it)

1. In the Supabase dashboard for project `mjtgtwscipjctmuaxick`, open the
   **SQL Editor** and run these migrations **in order**:
   `0001_init.sql` → `0003_seed_demo_data.sql` → `0004_dose_reminders.sql` →
   `0005_seed_dose_reminders.sql` → `0006_auto_escalation_engine.sql`. The
   last one builds the real rule-based engine that automatically detects
   missed doses and upcoming unconfirmed appointments — without it,
   escalations only exist if seeded by hand.
   - If `0006` errors on `create extension pg_cron` (some Supabase plans
     restrict this), skip that line and the two `cron.schedule(...)` lines —
     everything else still works via the **"Run Escalation Check"** button
     on the Escalation Rules page, which calls the same functions on demand.
2. Go to **Project Settings → API**, copy the **Project URL** and **anon
   public key** (safe for frontend code — never the `service_role` key).
3. Create `.env.local` from `.env.example` and fill both values in.
4. **Create your first user manually** — Supabase dashboard →
   **Authentication → Users → Add user**. A `profiles` row is auto-created
   for them (role defaults to `nurse` — change it in the `profiles` table
   if needed).
5. `npm run dev`, sign in with that user's email/password.

All five data domains (alerts, inventory, rules, handover, performance) are
wired to real Supabase tables — see "Data layer" below.

## Report generation

## CHW Local Inventory & Training Portal

Run `supabase/migrations/0013_chw_inventory_and_training.sql`. Closes the
last two flagged screens from the Figma inventory:
- **Local Inventory** (`/chw/inventory`) — a CHW's view of the same
  facility stock (this pilot has one shared inventory, not separate ward
  vs. field kits), with a real "Log Usage" action. The Figma design also
  shows a "Request Restock" button that silently adds stock -- that's
  intentionally NOT built, since it would fake an approval workflow that
  doesn't exist (that's the full-platform Replenishment Approval Flow,
  Phase 3+ scope).
- **Training Portal** (`/chw/training`) — real onboarding modules
  describing how this actual system works, with real per-CHW progress
  tracking and sequential unlocking, not the mockup's static "3/5
  Modules" placeholder.

## Pilot Feedback Log & Supervisor Dashboard

Run `supabase/migrations/0012_pilot_feedback.sql`. Two more Figma screens
that were genuinely pilot-relevant (not later-phase) and previously
unbuilt:
- **Pilot Feedback & Iteration Log** (`/feedback`) — real structured
  feedback collection, explicitly named for the 3-month pilot period.
- **Supervisor Dashboard** (`/supervisor`) — CHW performance roster and
  facility-wide KPIs. The Figma design's Regional Adherence Heatmap is
  intentionally not built — this pilot has no facility geolocation data,
  and fabricating map coordinates would be worse than leaving it out.

## Real-time notifications

Run `supabase/migrations/0011_enable_realtime.sql` -- required for the
notification bell to actually receive anything (enables Postgres change
streaming on the `escalations` table). Implements the proposal's §6
"notification service": when a new escalation is created (by the
auto-escalation engine, or manually), every connected staff session sees
it live, no page refresh needed. Click the bell to see recent
notifications; click one to jump straight to that patient.

Honest limitation: read/unread state is per-session, not persisted to the
database -- documented in `NotificationContext.tsx`.

## Security (role-based access)

Run `supabase/migrations/0009_role_based_rls.sql` to tighten Row-Level
Security from "any authenticated staff sees/edits everything" to real
role-based access, per the proposal's own risk mitigation (§10). After
this: nurses/admins can manage inventory, escalation rules, and shift
handovers; CHWs can read the same data but can't edit those (their nav
doesn't expose those screens anyway); both roles can read patients/
escalations/appointments and confirm doses via the USSD Simulator.

Run `supabase/migrations/0008_seed_stock_movements.sql` for realistic 30-day
consumption/reorder history (otherwise the monthly report will look sparse
since real movement data only accumulates from actual Stock-In/Stock-Out
clicks). Two real exports now work:
- **Ward Inventory → "Export Monthly Report (CSV)"** — per the proposal
  §3.2: consumption, remaining stock, expiring batches, and reorder history
  per medication, last 30 days.
- **Daily Performance Report → "Export CSV"** — today's scheduled/confirmed/
  missed dose counts and escalations opened.

Both generate real CSV files client-side from live Supabase data — no
external report-generation service involved.

## Trying out the CHW role

The app renders different content based on the logged-in user's role
(nurse/admin vs CHW) inside the same desktop shell — not a separate app.
To see the CHW view:

1. Run `supabase/migrations/0007_chw_visits.sql` (adds the `chw_visits` table)
   and `0010_chw_assignment_and_recurring_engine.sql` (adds per-CHW patient
   assignment).
2. In Supabase dashboard → **Authentication → Users → Add user**, create a
   second test login.
3. In **Table Editor → profiles**, find that new user's row and change
   `role` from `nurse` to `chw`.
4. Log out and back in as that user — the sidebar switches to Home / My
   Patients / Visit Log, and `/` shows the CHW-specific overview instead
   of the nurse's Escalation Inbox.
5. Optional: in **Table Editor → patients**, set `assigned_chw_id` on a
   patient to that CHW's user id to scope "My Patients" to just them —
   patients with `assigned_chw_id` left null are visible to any CHW.

## AI escalation priority setup (optional but recommended)

Implements the proposal's one specified AI feature for escalations
(§4: "Missed-dose escalation priority — AI-assisted"). Without this, the
Escalation Inbox still works fully — you'll just see an "AI Priority"
button instead of a computed ranking until it's deployed.

1. Get an Anthropic API key from https://console.anthropic.com (Settings → API Keys).
2. In the Supabase dashboard, go to **Edge Functions** → **Deploy a new function** → name it `rank-escalation-priority`.
3. Paste in the contents of `supabase/functions/rank-escalation-priority/index.ts`.
4. Under the function's **Secrets**, add `ANTHROPIC_API_KEY` with your key. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by Supabase — you don't need to set those.
5. Deploy. On the Escalation Inbox, click **"AI Priority"** next to any active alert's delay badge — it calls the function, which asks Claude to rank urgency based on medication risk, time missed, and the patient's escalation history, then writes the result back to that escalation.

The missed-dose *trigger* itself stays rule-based (a fixed time window) —
this only ranks priority for cases that already exist, exactly as the
proposal scopes it. Nothing else in the app calls an LLM.

## Architecture

```
src/
  components/
    layout/       # Sidebar, TopNav, AppShell (shared across all pages)
    ui/            # Reusable UI primitives (StatusBadge, etc.)
  pages/           # One file per route/screen
  services/        # Data access layer -- swap mock -> Supabase here only
  data/            # Mock data used by the mock service implementations
  types/           # Shared TypeScript domain types
```

**Rule:** pages and components only ever import from `src/services/index.ts`,
never from a specific implementation (e.g. `mockAlertsService.ts`) directly.
This keeps the eventual Supabase migration to one file.

## Screens -- build phases

| Phase | Screen | Status | Route |
|---|---|---|---|
| 1 | Nurse Escalation Inbox | Built | `/` |
| 1 | Follow-Up Log Modal | Built | opens from Escalation Inbox |
| 1 | Ward Inventory | Built | `/inventory` |
| 1 | Patient Enrollment (MVP Staff Registration) | Built | `/enrollment` |
| 1 | Escalation Rules Configuration | Built | `/settings` |
| 1 | Nurse Shift Handover | Built | `/handover` |
| 1 | Daily Performance Report | Built | `/reports` |
| 1 | Patient Discharge Summary | Built | `/discharge-summary` |
| 2 | AI Forecasting | Placeholder — needs real consumption data first, per proposal | `/forecasting` |

All Phase 1 pilot screens are built against mock data. Not built yet, and
intentionally out of scope for the pilot: the full Ministry/Health Authority
platform, Research Data Portal, and USSD/IVR gateway integration itself
(this is the staff-facing web dashboard only — the patient-facing USSD/IVR
flow is a separate telecom integration, not a web screen).

Each screen's visual design is sourced from the MediLink Figma file and ported
to match the token system in `src/index.css` (the `@theme` block).

## AI usage (matches proposal §4 exactly)

| Feature | Logic | Where |
|---|---|---|
| Dose reminder trigger | Rule-based | Backend (not yet built — see note below) |
| Missed-dose/appointment escalation **priority** | AI-assisted | `EscalationAlert.aiPriority` / `.aiReasoning` fields exist; not yet wired to a real model |
| Stock reorder threshold | Rule-based baseline | `InventoryItem.reorderThreshold`, computed in `mockInventoryService.ts` |
| Demand forecasting | AI/ML, once real data exists | `/forecasting` — placeholder until Phase 2 |
| Monthly/daily reporting | Rule-based aggregation | `/reports` |
| Patient risk flagging | AI-assisted | **Phase 2, not built** |

**Backend note:** this repo is the frontend only. The proposal's escalation
trigger logic (rule-based timer), USSD/IVR gateway integration, and the AI
service itself (escalation triage + demand forecasting) need a backend —
recommend Supabase (Postgres + Auth + RLS for the 5 staff roles) plus a small
Python service for the AI calls, kept separate from this frontend repo or
added as `/supabase` and `/ai-service` folders here, your call.

## i18n

`src/i18n/index.ts` — minimal EN/RW/FR dictionary. The proposal is explicit
that Kinyarwanda-first content matters for accessibility; this layer exists
so screens are translatable from the start rather than retrofitted later.
Currently only a handful of keys are wired — extend as each screen's copy
gets finalized.

## Design tokens

Colors are extracted directly from the Figma design and defined once in
`src/index.css`:

- `navy` (`#00346f`) -- primary brand/heading color
- `danger` (`#ba1a1a`) -- pending/urgent alerts
- `success` (`#006e25`) -- resolved states
- `warning-text` (`#eeb400`) -- in-progress states
- `border` (`#c2c6d3`) -- all hairline borders
- `bg` (`#f9f9ff`) -- app background

## Deploying to a real URL

Right now this only exists as code and a local dev server — no nurse or
CHW can actually reach it without someone running `npm run dev` on a
laptop. That's fine for building, not for a real pilot. `vercel.json` is
already in this repo (SPA rewrite rule, needed because React Router's
client-side routes like `/patients/:id` will 404 on a static host without
it).

**Vercel (recommended — free, connects directly to GitHub, no CLI needed):**

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. **Add New → Project**, select `MediLink-Adherence-Inventory-Platform`.
3. Vercel auto-detects Vite — leave the build settings as default (`npm run build`, output `dist`).
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   (same values as your local `.env.local`)
5. Click **Deploy**. You'll get a real `https://...vercel.app` URL within a minute or two.
6. Every future `git push` to `main` auto-redeploys — no extra steps.

One more thing to update once you have a real URL: in Supabase dashboard →
**Authentication → URL Configuration**, add your Vercel URL to the allowed
redirect URLs list, or login may be blocked from the deployed site.
