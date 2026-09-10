import { supabase } from '../lib/supabaseClient';

// Real Supabase-backed queries against the tables from
// supabase/migrations/0017_pharmacy_logistics_schema.sql. Not behind the
// swappable ServiceInterface pattern used by the 6 core domains (this
// mirrors supabaseUssdService.ts / supabaseDischargeService.ts instead --
// page-specific reads/writes, not one of the original interchangeable
// domains).

// ---------- Shipments (Order Tracking) ----------

export interface Shipment {
  id: string;
  reference: string;
  route: string; // "origin → destination", matches the existing OrderTracking.tsx display
  status: string;
  eta: string | null;
}

export async function getShipments(): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from('shipments')
    .select('id, reference, origin, destination, status, eta, delivered_at')
    .order('dispatched_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id,
    reference: s.reference,
    route: `${s.origin} → ${s.destination}`,
    status: s.status,
    eta: s.status === 'delivered' ? 'Completed' : s.eta,
  }));
}

// ---------- Cold Chain Readings (Cold Chain Monitor + Thermal Audit Log) ----------

export interface ColdChainReading {
  id: string;
  label: string; // shipment route or batch reference, whichever this reading is for
  temperatureCelsius: number;
  withinRange: boolean;
  recordedAt: string;
}

export async function getColdChainReadings(): Promise<ColdChainReading[]> {
  const { data, error } = await supabase
    .from('cold_chain_readings')
    .select('id, batch_reference, temperature_celsius, within_range, recorded_at, shipments:shipment_id ( origin, destination )')
    .order('recorded_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return ((data ?? []) as unknown as { id: string; batch_reference: string | null; temperature_celsius: number; within_range: boolean; recorded_at: string; shipments: { origin: string; destination: string } | null }[]).map((r) => ({
    id: r.id,
    label: r.shipments ? `${r.shipments.origin} → ${r.shipments.destination}` : (r.batch_reference ?? 'Unknown batch'),
    temperatureCelsius: r.temperature_celsius,
    withinRange: r.within_range,
    recordedAt: r.recorded_at,
  }));
}

export async function getLatestReadingForBatch(batchReference: string): Promise<ColdChainReading | null> {
  const { data, error } = await supabase
    .from('cold_chain_readings')
    .select('id, batch_reference, temperature_celsius, within_range, recorded_at')
    .eq('batch_reference', batchReference)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, label: data.batch_reference ?? batchReference, temperatureCelsius: data.temperature_celsius, withinRange: data.within_range, recordedAt: data.recorded_at };
}

export async function logColdChainReading(input: { batchReference?: string; shipmentId?: string; temperatureCelsius: number }): Promise<void> {
  const { error } = await supabase.from('cold_chain_readings').insert({
    batch_reference: input.batchReference ?? null,
    shipment_id: input.shipmentId ?? null,
    temperature_celsius: input.temperatureCelsius,
  });
  if (error) throw error;
}

// ---------- Deliveries (Delivery Receipt flow) ----------

export interface DeliveryBatch {
  id: string;
  batchReference: string;
  sourceHub: string;
  expectedQuantity: number;
  driverName: string | null;
  dispatchedAt: string | null;
  status: string;
}

// The one batch currently awaiting receipt -- DeliveryReceipt.tsx works
// through a single incoming batch at a time, matching the Figma flow.
export async function getNextPendingDelivery(): Promise<DeliveryBatch | null> {
  const { data, error } = await supabase
    .from('deliveries')
    .select('id, batch_reference, source_hub, expected_quantity, driver_name, dispatched_at, status')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    batchReference: data.batch_reference,
    sourceHub: data.source_hub,
    expectedQuantity: data.expected_quantity,
    driverName: data.driver_name,
    dispatchedAt: data.dispatched_at,
    status: data.status,
  };
}

export async function completeDeliveryReceipt(
  deliveryId: string,
  input: {
    actualQuantity: number;
    sealIntact: boolean;
    quantityMatches: boolean;
    packagingUndamaged: boolean;
    discrepancyNotes?: string;
    receivedBy?: string | null;
  }
): Promise<void> {
  const accepted = input.sealIntact && input.quantityMatches && input.packagingUndamaged;
  const { error } = await supabase
    .from('deliveries')
    .update({
      actual_quantity: input.actualQuantity,
      seal_intact: input.sealIntact,
      quantity_matches: input.quantityMatches,
      packaging_undamaged: input.packagingUndamaged,
      discrepancy_notes: input.discrepancyNotes ?? null,
      status: accepted ? 'accepted' : 'discrepancy_logged',
      received_by: input.receivedBy ?? null,
      received_at: new Date().toISOString(),
    })
    .eq('id', deliveryId);
  if (error) throw error;
}

// ---------- Replenishment Requests ----------

export interface ReplenishmentRequestItemInput {
  itemName: string;
  quantity: number;
  unit?: string;
}

export interface ReplenishmentRequestRow {
  id: string;
  reference: string;
  urgency: string;
  note: string | null;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  items: { itemName: string; quantity: number; unit: string | null }[];
}

export async function createReplenishmentRequest(input: {
  items: ReplenishmentRequestItemInput[];
  urgency: 'routine' | 'urgent';
  note?: string;
  requestedBy?: string | null;
  facilityName?: string | null;
}): Promise<void> {
  const { data: request, error: requestError } = await supabase
    .from('replenishment_requests')
    .insert({
      urgency: input.urgency,
      note: input.note ?? null,
      requested_by: input.requestedBy ?? null,
      facility_name: input.facilityName ?? null,
    })
    .select('id')
    .single();
  if (requestError || !request) throw requestError ?? new Error('Failed to create replenishment request');

  const itemRows = input.items.map((item) => ({
    request_id: request.id,
    item_name: item.itemName,
    quantity: item.quantity,
    unit: item.unit ?? null,
  }));
  const { error: itemsError } = await supabase.from('replenishment_request_items').insert(itemRows);
  if (itemsError) throw itemsError;
}

export async function getReplenishmentRequestById(id: string): Promise<ReplenishmentRequestRow | null> {
  const { data: request, error } = await supabase
    .from('replenishment_requests')
    .select('id, reference, urgency, note, status, submitted_at, reviewed_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!request) return null;
  const { data: items } = await supabase.from('replenishment_request_items').select('item_name, quantity, unit').eq('request_id', id);
  return {
    id: request.id,
    reference: request.reference,
    urgency: request.urgency,
    note: request.note,
    status: request.status,
    submittedAt: request.submitted_at,
    reviewedAt: request.reviewed_at,
    items: (items ?? []).map((i) => ({ itemName: i.item_name, quantity: i.quantity, unit: i.unit })),
  };
}

export async function getReplenishmentRequests(): Promise<ReplenishmentRequestRow[]> {
  const { data: requests, error } = await supabase
    .from('replenishment_requests')
    .select('id, reference, urgency, note, status, submitted_at, reviewed_at')
    .order('submitted_at', { ascending: false })
    .limit(30);
  if (error) throw error;

  return Promise.all(
    (requests ?? []).map(async (r) => {
      const { data: items } = await supabase
        .from('replenishment_request_items')
        .select('item_name, quantity, unit')
        .eq('request_id', r.id);
      return {
        id: r.id,
        reference: r.reference,
        urgency: r.urgency,
        note: r.note,
        status: r.status,
        submittedAt: r.submitted_at,
        reviewedAt: r.reviewed_at,
        items: (items ?? []).map((i) => ({ itemName: i.item_name, quantity: i.quantity, unit: i.unit })),
      };
    })
  );
}

export async function reviewReplenishmentRequest(requestId: string, decision: 'in_transit' | 'rejected', reviewerId?: string | null): Promise<void> {
  const { error } = await supabase
    .from('replenishment_requests')
    .update({ status: decision, reviewed_by: reviewerId ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) throw error;
}

// ---------- Medication Usage Logs (CHW field dispensing) ----------

export async function logMedicationUsage(input: {
  patientId?: string | null;
  chwId?: string | null;
  itemName: string;
  batchReference?: string;
  quantity: number;
  doseObserved: boolean;
}): Promise<void> {
  const { error } = await supabase.from('medication_usage_logs').insert({
    patient_id: input.patientId ?? null,
    chw_id: input.chwId ?? null,
    batch_reference: input.batchReference ?? null,
    quantity: input.quantity,
    dose_observed: input.doseObserved,
  });
  if (error) throw error;
}
