import { supabase } from '../lib/supabaseClient';

export interface FeedbackEntry {
  id: string;
  reporterName: string;
  category: 'workflow_friction' | 'system_bug' | 'feature_request';
  description: string;
  status: 'under_review' | 'planned' | 'resolved';
  createdAt: string;
}

export interface FeedbackOverview {
  workflowFrictionPct: number;
  systemBugsPct: number;
  featureRequestsPct: number;
  underReviewCount: number;
  plannedCount: number;
  total: number;
}

// Matches Figma's "Pilot Feedback & Iteration Log" -- real data, not the
// static "42 entries" shown in the design mockup.
export async function getFeedback(): Promise<FeedbackEntry[]> {
  const { data, error } = await supabase
    .from('pilot_feedback')
    .select('id, category, description, status, created_at, profiles:reported_by ( full_name )')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as {
    id: string; category: FeedbackEntry['category']; description: string; status: FeedbackEntry['status'];
    created_at: string; profiles: { full_name: string } | null;
  }[]).map((r) => ({
    id: r.id,
    reporterName: r.profiles?.full_name ?? 'Anonymous',
    category: r.category,
    description: r.description,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function getFeedbackOverview(): Promise<FeedbackOverview> {
  const { data, error } = await supabase.from('pilot_feedback').select('category, status');
  if (error) throw error;
  const rows = data ?? [];
  const total = rows.length;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));
  return {
    workflowFrictionPct: pct(rows.filter((r) => r.category === 'workflow_friction').length),
    systemBugsPct: pct(rows.filter((r) => r.category === 'system_bug').length),
    featureRequestsPct: pct(rows.filter((r) => r.category === 'feature_request').length),
    underReviewCount: rows.filter((r) => r.status === 'under_review').length,
    plannedCount: rows.filter((r) => r.status === 'planned').length,
    total,
  };
}

export async function submitFeedback(category: FeedbackEntry['category'], description: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('pilot_feedback').insert({
    reported_by: userData.user?.id ?? null,
    category,
    description,
  });
  if (error) throw error;
}
