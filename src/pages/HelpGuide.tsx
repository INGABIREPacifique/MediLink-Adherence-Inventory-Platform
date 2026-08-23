import { AlertTriangle, Package, UserCheck, RefreshCcw, BarChart3, Radio, FileCheck, Smartphone, Settings, Home, Users, ClipboardList } from 'lucide-react';

const nurseAdminItems = [
  { icon: AlertTriangle, label: 'CHW Escalations', body: 'The daily work queue. Every time a patient misses a scheduled dose confirmation or an upcoming follow-up appointment goes unconfirmed, it appears here automatically -- you don\u2019t need to check for it manually. Click the message icon on any row to log a follow-up call and its outcome.' },
  { icon: UserCheck, label: 'Patient Adherence', body: 'Enroll a newly discharged patient here, before they leave the hospital. Add every medication they\u2019re going home with -- each gets tracked and confirmed independently, so a missed dose of one medication doesn\u2019t get confused with another.' },
  { icon: Package, label: 'Stock Tracking', body: 'The ward\u2019s own medication inventory -- separate from patient monitoring. Log Stock-In when supplies arrive, Stock-Out as they\u2019re dispensed. Items below their reorder threshold are flagged automatically.' },
  { icon: RefreshCcw, label: 'Shift Handover', body: 'At the start or end of a shift, review what\u2019s still unresolved -- open escalations and low-stock items -- and leave notes for the next person coming on.' },
  { icon: BarChart3, label: 'Facility Analytics', body: 'Today\u2019s adherence numbers at a glance: how many doses were scheduled, confirmed, and missed, plus a 7-day trend. Export a real CSV for record-keeping from here.' },
  { icon: Radio, label: 'AI Forecasting', body: 'Currently inactive on purpose -- demand forecasting needs real consumption history to be trustworthy, and faking it before then would be misleading. Shows today\u2019s rule-based stock status in the meantime.' },
  { icon: FileCheck, label: 'Discharge Summary', body: 'A printable summary of a patient\u2019s full monitoring period -- their adherence rate and per-medication completion status, computed from their real dose history.' },
  { icon: Smartphone, label: 'USSD Simulator', body: 'Stands in for the real phone-based system patients actually use to confirm doses (no telecom integration exists yet for this pilot). Useful for testing the confirmation flow end-to-end.' },
  { icon: Settings, label: 'System Settings', body: 'Configure the missed-dose escalation window (default 4 hours) and the Consecutive Misses rule. The \u201cRun Escalation Check\u201d button here triggers the automatic detection immediately, instead of waiting for the scheduled check.' },
];

const chwItems = [
  { icon: Home, label: 'Home', body: 'Your daily overview: how many patients need an urgent visit, how many follow-ups are due today, and a Priority Tasks list ranked by urgency. Call a patient directly, or log a visit once you\u2019ve followed up.' },
  { icon: Users, label: 'My Patients', body: 'Everyone assigned to you, plus any unassigned patients at the facility. Click a name to see their full weekly adherence history.' },
  { icon: ClipboardList, label: 'Visit Log', body: 'Record every home visit you make -- who you saw, the outcome, and any notes. This becomes part of that patient\u2019s permanent record.' },
];

// Fixes a real gap: the sidebar's "Help Center" link went nowhere
// (href="#") for the entire build until now. This explains what each nav
// item actually does, in plain language, for whichever role is looking at it.
export default function HelpGuide() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Help & Guide</h1>
        <p className="max-w-2xl text-body">What each part of MediLink is for, and how it fits into a typical day.</p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">Nurse / Admin</h2>
        <div className="flex flex-col gap-3">
          {nurseAdminItems.map(({ icon: Icon, label, body }) => (
            <div key={label} className="flex gap-4 rounded-lg border border-border bg-white p-4 shadow-sm">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy">
                <Icon size={16} />
              </span>
              <div>
                <p className="font-bold text-ink">{label}</p>
                <p className="text-sm text-body">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">Community Health Worker (CHW)</h2>
        <div className="flex flex-col gap-3">
          {chwItems.map(({ icon: Icon, label, body }) => (
            <div key={label} className="flex gap-4 rounded-lg border border-border bg-white p-4 shadow-sm">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-bg text-success-text">
                <Icon size={16} />
              </span>
              <div>
                <p className="font-bold text-ink">{label}</p>
                <p className="text-sm text-body">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
