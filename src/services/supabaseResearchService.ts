import { supabase } from '../lib/supabaseClient';

// Real Supabase-backed queries against research_data_requests from
// supabase/migrations/0020_research_data_requests.sql.

export interface DataAccessRequestInput {
  researcherName: string;
  email: string;
  institution?: string;
  purpose: string;
  datasetRequested: string;
}

export async function submitDataAccessRequest(input: DataAccessRequestInput): Promise<void> {
  const { error } = await supabase.from('research_data_requests').insert({
    researcher_name: input.researcherName,
    email: input.email,
    institution: input.institution ?? null,
    purpose: input.purpose,
    dataset_requested: input.datasetRequested,
  });
  if (error) throw error;
}

export interface ResearchDataRequestRow {
  id: string;
  datasetRequested: string;
  purpose: string;
  status: string;
  submittedAt: string;
  decisionNote: string | null;
}

// Researcher Dashboard: a researcher's own past requests, looked up by the
// email they used to submit -- there's no real researcher auth yet (same
// "no login on this portal" pattern as the rest of Public/Research), so
// this takes email as an explicit lookup key rather than pulling from a
// session.
export async function getRequestsByEmail(email: string): Promise<ResearchDataRequestRow[]> {
  const { data, error } = await supabase
    .from('research_data_requests')
    .select('id, dataset_requested, purpose, status, submitted_at, decision_note')
    .eq('email', email)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    datasetRequested: r.dataset_requested,
    purpose: r.purpose,
    status: r.status,
    submittedAt: r.submitted_at,
    decisionNote: r.decision_note,
  }));
}
