import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { getMinistryReports, decideOnReport, type MinistryReportRow } from '../../services/supabaseMinistryService';

// Matches Figma "Ministry of Health - Report Approval Workflow" content.
// Real data as of migrations 0018-0019. Approve/Reject now write real
// report_approvals rows -- previously every button here was decorative
// since no backend existed to approve against. Signature is recorded as
// a note/audit trail (real cryptographic e-signature/PKI is a bigger,
// still-deferred decision, same as flagged in the original handoff doc).
export default function MinistryReportApproval() {
  const [reports, setReports] = useState<MinistryReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  function load() {
    setLoading(true);
    getMinistryReports('pending_review').then((r) => {
      setReports(r);
      setSelectedId((current) => current ?? r[0]?.id ?? null);
      setLoading(false);
    });
  }

  useEffect(load, []);

  const selected = reports.find((r) => r.id === selectedId) ?? null;

  async function decide(decision: 'approved' | 'rejected' | 'changes_requested') {
    if (!selected) return;
    setActing(true);
    await decideOnReport(selected.id, decision, decision === 'approved' ? 'Digitally acknowledged in Report Approval' : undefined);
    setActing(false);
    load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-ink">Approval Queue</h2>
          <p className="text-sm text-body">Reports awaiting administrative sign-off.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Report Title</th><th className="px-5 py-3">Facility</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-body">Loading…</td></tr>}
              {!loading && reports.length === 0 && <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-body">No reports awaiting review.</td></tr>}
              {reports.map((r) => (
                <tr key={r.id} onClick={() => setSelectedId(r.id)} className={`cursor-pointer border-b border-border last:border-0 ${r.id === selectedId ? 'bg-[#d7e2ff]/30' : ''}`}>
                  <td className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-navy-light"><FileText size={14} />{r.title}</td>
                  <td className="px-5 py-3 text-sm text-body">{r.facilityName ?? 'National'}</td>
                  <td className="px-5 py-3 text-sm text-body">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">Pending Review</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        {!selected && <p className="text-sm text-body">Select a report from the queue.</p>}
        {selected && (
          <>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-ink">{selected.title}</h3>
            </div>
            <p className="text-xs text-body">{selected.facilityName ?? 'National'} · {new Date(selected.createdAt).toLocaleDateString()}</p>

            <p className="mt-4 text-xs font-semibold uppercase text-body">Approval History</p>
            <div className="mt-2 flex flex-col gap-2">
              {selected.approvals.length === 0 && <div className="flex items-center gap-2 text-sm"><Clock size={16} className="text-body" /><p className="text-navy-light">Awaiting first review</p></div>}
              {selected.approvals.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-success" />
                  <div><p className="font-semibold capitalize text-ink">{a.decision.replace('_', ' ')}</p><p className="text-xs text-success-text">{new Date(a.decidedAt).toLocaleDateString()}</p></div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <button disabled={acting} onClick={() => decide('rejected')} className="flex-1 rounded-lg border border-danger/30 bg-danger-bg/40 py-2 text-xs font-semibold text-danger-text disabled:opacity-50">Reject</button>
              <button disabled={acting} onClick={() => decide('changes_requested')} className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-body disabled:opacity-50">Request Revision</button>
              <button disabled={acting} onClick={() => decide('approved')} className="flex-1 rounded-lg bg-navy py-2 text-xs font-semibold text-white disabled:opacity-50">Approve &amp; Sign</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
