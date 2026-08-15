# MediLink Rwanda — Pilot MVP

Web dashboard for the MediLink Rwanda pilot: post-discharge medication adherence
escalation and ward inventory management for hospital staff.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4**
- **react-router-dom** for client-side routing
- **lucide-react** for icons
- Data layer abstracted behind `src/services/` — currently backed by in-memory
  mock data (`src/data/`), designed to swap to Supabase with a one-line change
  in `src/services/index.ts` once the backend is ready.

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

| Phase | Screen | Status |
|---|---|---|
| 1 | Nurse Escalation Inbox | Built |
| 2 | Follow-Up Log Modal | Planned |
| 2 | Nurse Daily Handover | Planned |
| 3 | Ward Inventory | Planned |
| 3 | Escalation Rules Configuration | Planned |
| 4 | Staff Registration Portal | Planned |
| 4 | Patient Discharge Summary | Planned |
| 4 | Daily Performance Report | Planned |

Each screen's visual design is sourced from the MediLink Figma file and ported
to match the token system in `src/index.css` (the `@theme` block).

## Design tokens

Colors are extracted directly from the Figma design and defined once in
`src/index.css`:

- `navy` (`#00346f`) -- primary brand/heading color
- `danger` (`#ba1a1a`) -- pending/urgent alerts
- `success` (`#006e25`) -- resolved states
- `warning-text` (`#eeb400`) -- in-progress states
- `border` (`#c2c6d3`) -- all hairline borders
- `bg` (`#f9f9ff`) -- app background
