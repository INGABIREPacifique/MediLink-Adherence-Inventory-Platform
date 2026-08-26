import { CheckCircle2, Clock, FileText } from 'lucide-react';

// Matches Figma "Ministry of Health - Report Approval Workflow" content.
// FRONTEND ONLY -- mock data, buttons are decorative (no approval/
// signature backend exists yet -- that's a genuinely sensitive workflow
// to wire for real, not something to fake).
const queue = [
  { title: 'Q3 National Adherence Review', requester: 'NHA Admin', date: 'Oct 12, 2023', status: 'Pending DG Review', selected: true },
  { title: 'September Supply Chain Audit', requester: 'Logistics Dept', date: 'Oct 10, 2023', status: 'In Review - Pharmacy', selected: false },
  { title: 'Kigali Regional Outcome Mnt.', requester: 'Reg. Director', date: 'Oct 08, 2023', status: 'Pending DG Review', selected: false },
];

export default function MinistryReportApproval() {
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
              <tr><th className="px-5 py-3">Report Title</th><th className="px-5 py-3">Requester</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody>
              {queue.map((r) => (
                <tr key={r.title} className={`border-b border-border last:border-0 ${r.selected ? 'bg-[#d7e2ff]/30' : ''}`}>
                  <td className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-navy-light"><FileText size={14} />{r.title}</td>
                  <td className="px-5 py-3 text-sm text-body">{r.requester}</td>
                  <td className="px-5 py-3 text-sm text-body">{r.date}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status.includes('Pending') ? 'bg-success-bg text-success-text' : 'bg-row-alt text-body'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-ink">Q3 National Adherence Review</h3>
          <span className="rounded-full bg-danger-bg px-2 py-1 text-[10px] font-semibold text-danger-text">HIGH PRIORITY</span>
        </div>
        <p className="text-xs text-body">NHA Admin · Oct 12, 2023</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded bg-bg p-3"><p className="text-[10px] font-semibold uppercase text-body">Adherence Rate</p><p className="text-xl font-bold text-success-text">88.4%</p></div>
          <div className="rounded bg-bg p-3"><p className="text-[10px] font-semibold uppercase text-body">Supply Efficiency</p><p className="text-xl font-bold text-navy">92.0%</p></div>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase text-body">Required Signatories</p>
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-success" /><div><p className="font-semibold text-ink">Director of Pharmacy</p><p className="text-xs text-success-text">Approved Oct 13</p></div></div>
          <div className="flex items-center gap-2 text-sm"><Clock size={16} className="text-body" /><div><p className="font-semibold text-ink">Director General of MoH</p><p className="text-xs text-navy-light">Pending Review</p></div></div>
        </div>

        <div className="mt-5 flex gap-2">
          <button className="flex-1 rounded-lg border border-danger/30 bg-danger-bg/40 py-2 text-xs font-semibold text-danger-text">Reject</button>
          <button className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-body">Request Revision</button>
          <button className="flex-1 rounded-lg bg-navy py-2 text-xs font-semibold text-white">Approve &amp; Sign</button>
        </div>
      </div>
    </div>
  );
}
