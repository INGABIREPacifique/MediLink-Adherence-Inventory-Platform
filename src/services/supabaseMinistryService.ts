import { supabase } from '../lib/supabaseClient';

// Real Supabase-backed queries against facilities/report_templates/
// ministry_reports/report_approvals from supabase/migrations/
// 0018_add_ministry_role.sql and 0019_ministry_reports_schema.sql.

// ---------- Dashboard summary ----------
// This pilot's patients/inventory aren't yet linked to a specific
// facility_id (only profiles.facility_id exists) -- so this is honestly a
// pilot-wide summary, not a real per-district breakdown yet. Presented as
// such rather than inventing facility-level splits from data that
// doesn't carry that dimension.

export interface MinistryDashboardSummary {
  adherenceRatePct: number;
  criticalStockouts: number;
  activeChwCount: number;
  attentionItems: { title: string; issue: string; level: 'critical' | 'warning' }[];
}

export async function getMinistryDashboardSummary(): Promise<MinistryDashboardSummary> {
  const [{ data: doses }, { data: inventory }, { data: chws }] = await Promise.all([
    supabase.from('dose_reminders').select('confirmed').lte('scheduled_for', new Date().toISOString()),
    supabase.from('inventory_items').select('name, status'),
    supabase.from('profiles').select('id').eq('role', 'chw'),
  ]);

  const doseRows = doses ?? [];
  const adherenceRatePct = doseRows.length ? Math.round((doseRows.filter((d) => d.confirmed).length / doseRows.length) * 100) : 0;
  const criticalItems = (inventory ?? []).filter((i) => i.status === 'critical');

  const attentionItems: MinistryDashboardSummary['attentionItems'] = criticalItems.map((i) => ({
    title: i.name,
    issue: 'Critical stock level',
    level: 'critical' as const,
  }));

  return {
    adherenceRatePct,
    criticalStockouts: criticalItems.length,
    activeChwCount: (chws ?? []).length,
    attentionItems,
  };
}

// ---------- Facilities ----------

export interface Facility {
  id: string;
  name: string;
  facilityType: string | null;
  district: string | null;
  sector: string | null;
}

export async function getFacilities(): Promise<Facility[]> {
  const { data, error } = await supabase.from('facilities').select('id, name, facility_type, district, sector').order('name');
  if (error) throw error;
  return (data ?? []).map((f) => ({ id: f.id, name: f.name, facilityType: f.facility_type, district: f.district, sector: f.sector }));
}

export async function createFacility(input: { name: string; facilityType?: string; district?: string; sector?: string }): Promise<void> {
  const { error } = await supabase.from('facilities').insert({
    name: input.name,
    facility_type: input.facilityType ?? null,
    district: input.district ?? null,
    sector: input.sector ?? null,
  });
  if (error) throw error;
}

// ---------- Report Templates ----------

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  fields: { label: string }[];
}

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  const { data, error } = await supabase.from('report_templates').select('id, name, description, fields').order('name');
  if (error) throw error;
  return (data ?? []).map((t) => ({ id: t.id, name: t.name, description: t.description, fields: (t.fields as { label: string }[]) ?? [] }));
}

export async function createReportTemplate(input: { name: string; description?: string; fields: { label: string }[] }): Promise<void> {
  const { error } = await supabase.from('report_templates').insert({ name: input.name, description: input.description ?? null, fields: input.fields });
  if (error) throw error;
}

// ---------- Ministry Reports + Approvals ----------

export interface MinistryReportRow {
  id: string;
  title: string;
  status: string;
  facilityName: string | null;
  createdAt: string;
  approvals: { decision: string; decidedAt: string; note: string | null }[];
}

export async function getMinistryReports(status?: string): Promise<MinistryReportRow[]> {
  let query = supabase
    .from('ministry_reports')
    .select('id, title, status, created_at, facilities:facility_id ( name )')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;

  return Promise.all(
    ((data ?? []) as unknown as { id: string; title: string; status: string; created_at: string; facilities: { name: string } | null }[]).map(async (r) => {
      const { data: approvals } = await supabase
        .from('report_approvals')
        .select('decision, decided_at, signature_note')
        .eq('report_id', r.id)
        .order('decided_at', { ascending: true });
      return {
        id: r.id,
        title: r.title,
        status: r.status,
        facilityName: r.facilities?.name ?? null,
        createdAt: r.created_at,
        approvals: (approvals ?? []).map((a) => ({ decision: a.decision, decidedAt: a.decided_at, note: a.signature_note })),
      };
    })
  );
}

export async function createMinistryReport(input: { title: string; facilityId?: string; templateId?: string; periodStart?: string; periodEnd?: string }): Promise<void> {
  const { error } = await supabase.from('ministry_reports').insert({
    title: input.title,
    facility_id: input.facilityId ?? null,
    template_id: input.templateId ?? null,
    period_start: input.periodStart ?? null,
    period_end: input.periodEnd ?? null,
    status: 'pending_review',
  });
  if (error) throw error;
}

export async function decideOnReport(reportId: string, decision: 'approved' | 'rejected' | 'changes_requested', signatureNote?: string): Promise<void> {
  const { error: approvalError } = await supabase.from('report_approvals').insert({
    report_id: reportId,
    decision,
    signature_note: signatureNote ?? null,
  });
  if (approvalError) throw approvalError;

  const newStatus = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'pending_review';
  const { error: reportError } = await supabase.from('ministry_reports').update({ status: newStatus }).eq('id', reportId);
  if (reportError) throw reportError;
}
