-- Backs every Pharmacy Logistics screen currently rendering from a local
-- mock array: OrderTracking.tsx, ColdChainMonitor.tsx, ThermalAuditLog.tsx,
-- DeliveryReceipt.tsx, ReplenishmentRequest.tsx + ReplenishmentApproval.tsx,
-- chw/LogMedicationUsage.tsx, chw/RequestStatusTracker.tsx.
--
-- None of these 8 screens had any table behind them -- the handoff doc's
-- own "MOCK/FRONTEND-ONLY" list confirms Replenishment Approval, Order
-- Tracking, Cold Chain Monitor and Thermal Audit Log were built display-only
-- from day one, and the 4 newer screens were built the same way (frontend
-- first, per this project's stated order).
--
-- Reuses the existing inventory_items table for item identity where
-- possible; does not duplicate stock_movements (which already tracks
-- delta/logged_at for consumption reporting) -- these new tables record
-- the *process* around stock movement (a shipment arriving, a cold chain
-- reading, a request being made), not the resulting stock delta itself.

-- ---------- 1. Shipments (Order Tracking) ----------

create table shipments (
  id uuid primary key default gen_random_uuid(),
  reference text not null, -- e.g. "SHP-4821", human-facing, distinct from the uuid pk
  origin text not null,
  destination text not null,
  status text not null default 'in_transit', -- in_transit | delivered | delayed
  dispatched_at timestamptz not null default now(),
  eta timestamptz,
  delivered_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index shipments_status_idx on shipments(status);

-- ---------- 2. Cold Chain Readings (Cold Chain Monitor + Thermal Audit Log) ----------
-- Both existing mock screens show the same underlying concept (a
-- temperature reading against a threshold, for either an in-transit
-- shipment or a received batch) at different granularity -- combined into
-- one table rather than two, distinguished by an optional shipment_id.

create table cold_chain_readings (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references shipments(id) on delete set null,
  batch_reference text, -- e.g. "Insulin Batch #BX-8903", for readings not tied to a shipment row
  temperature_celsius numeric(5, 2) not null,
  threshold_min_celsius numeric(5, 2) not null default 2.0,
  threshold_max_celsius numeric(5, 2) not null default 8.0,
  within_range boolean generated always as (
    temperature_celsius >= threshold_min_celsius and temperature_celsius <= threshold_max_celsius
  ) stored,
  recorded_at timestamptz not null default now()
);

create index cold_chain_readings_shipment_id_idx on cold_chain_readings(shipment_id);

-- ---------- 3. Deliveries (Delivery Receipt flow) ----------

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references inventory_items(id),
  batch_reference text not null,
  source_hub text not null,
  expected_quantity integer not null,
  actual_quantity integer,
  driver_name text,
  dispatched_at timestamptz,
  seal_intact boolean,
  quantity_matches boolean,
  packaging_undamaged boolean,
  discrepancy_notes text,
  status text not null default 'pending', -- pending | accepted | discrepancy_logged
  received_by uuid references profiles(id),
  received_at timestamptz,
  created_at timestamptz not null default now()
);

create index deliveries_item_id_idx on deliveries(item_id);

-- ---------- 4. Replenishment Requests (requesting side) ----------
-- Distinct from inventory_items.reorder_threshold (the automatic baseline
-- trigger) -- this is a nurse/staff-initiated manual request, which is what
-- ReplenishmentApproval.tsx (admin side) and ReplenishmentRequest.tsx
-- (requesting side) both need a real table for.

create table replenishment_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null default ('REQ-' || substr(gen_random_uuid()::text, 1, 4)),
  requested_by uuid references profiles(id),
  facility_name text,
  urgency text not null default 'routine', -- routine | urgent
  note text,
  status text not null default 'pending_approval', -- pending_approval | in_transit | delivered | rejected
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz
);

create table replenishment_request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references replenishment_requests(id) on delete cascade,
  item_id uuid references inventory_items(id),
  item_name text not null, -- denormalized so the request still reads clearly if the catalogue item is later renamed/removed
  quantity integer not null,
  unit text
);

create index replenishment_request_items_request_id_idx on replenishment_request_items(request_id);

-- ---------- 5. Medication Usage Logs (CHW field dispensing) ----------

create table medication_usage_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  chw_id uuid references profiles(id),
  item_id uuid references inventory_items(id),
  batch_reference text,
  quantity integer not null,
  dose_observed boolean not null default false,
  logged_at timestamptz not null default now()
);

create index medication_usage_logs_patient_id_idx on medication_usage_logs(patient_id);

-- ---------- RLS ----------
-- Same pattern used throughout the project: all authenticated staff can
-- read (nurses, CHWs, and admins all need visibility into logistics),
-- nurse/admin manage shipments/deliveries/approvals, and CHWs can also
-- create their own usage logs and requests (they're the ones in the field).

alter table shipments enable row level security;
alter table cold_chain_readings enable row level security;
alter table deliveries enable row level security;
alter table replenishment_requests enable row level security;
alter table replenishment_request_items enable row level security;
alter table medication_usage_logs enable row level security;

create policy "All staff read shipments" on shipments for select using (auth.role() = 'authenticated');
create policy "Nurse/admin manage shipments" on shipments for all using (current_user_role() = ANY (ARRAY['nurse'::user_role, 'admin'::user_role]));

create policy "All staff read cold_chain_readings" on cold_chain_readings for select using (auth.role() = 'authenticated');
create policy "Staff insert cold_chain_readings" on cold_chain_readings for insert with check (auth.role() = 'authenticated');

create policy "All staff read deliveries" on deliveries for select using (auth.role() = 'authenticated');
create policy "Staff insert deliveries" on deliveries for insert with check (auth.role() = 'authenticated');
create policy "Staff update deliveries" on deliveries for update using (auth.role() = 'authenticated');

create policy "All staff read replenishment_requests" on replenishment_requests for select using (auth.role() = 'authenticated');
create policy "Staff insert replenishment_requests" on replenishment_requests for insert with check (auth.role() = 'authenticated');
create policy "Nurse/admin review replenishment_requests" on replenishment_requests for update using (current_user_role() = ANY (ARRAY['nurse'::user_role, 'admin'::user_role]));

create policy "All staff read replenishment_request_items" on replenishment_request_items for select using (auth.role() = 'authenticated');
create policy "Staff insert replenishment_request_items" on replenishment_request_items for insert with check (auth.role() = 'authenticated');

create policy "All staff read medication_usage_logs" on medication_usage_logs for select using (auth.role() = 'authenticated');
create policy "CHW/nurse insert medication_usage_logs" on medication_usage_logs for insert with check (current_user_role() = ANY (ARRAY['chw'::user_role, 'nurse'::user_role, 'admin'::user_role]));
