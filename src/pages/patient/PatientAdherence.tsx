import { Check, X, Clock } from 'lucide-react';

// FRONTEND ONLY -- mock data. Visual pattern matches the staff-facing
// PatientHistory.tsx (weekly streak + detailed history), reused here with
// first-person patient-facing copy.
const weekStatus = [
  { day: 'Mon', status: 'taken' },
  { day: 'Tue', status: 'taken' },
  { day: 'Wed', status: 'missed' },
  { day: 'Thu', status: 'taken' },
  { day: 'Fri', status: 'taken' },
  { day: 'Sat', status: 'pending' },
  { day: 'Sun', status: 'pending' },
] as const;

const dayIcon = {
  taken: { bg: 'bg-success text-white', icon: <Check size={16} /> },
  missed: { bg: 'bg-danger text-white', icon: <X size={16} /> },
  pending: { bg: 'bg-row-alt text-body', icon: <Clock size={16} /> },
};

const recentDoses = [
  { date: 'Oct 26, 08:00 AM', medication: 'Rifampicin/Isoniazid', status: 'taken' },
  { date: 'Oct 25, 08:00 PM', medication: 'Pyridoxine', status: 'taken' },
  { date: 'Oct 25, 08:00 AM', medication: 'Rifampicin/Isoniazid', status: 'missed' },
  { date: 'Oct 24, 08:15 AM', medication: 'Rifampicin/Isoniazid', status: 'late' },
];

const statusStyles: Record<string, string> = {
  taken: 'bg-success-bg text-success-text',
  missed: 'bg-danger-bg text-danger-text',
  late: 'bg-warning-bg text-warning-text',
};

export default function PatientAdherence() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Your Adherence</h1>
        <p className="text-body">How consistently you've been taking your medication.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Adherence Rate</p>
          <p className="text-3xl font-bold text-navy">92%</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Doses Taken</p>
          <p className="text-3xl font-bold text-success-text">46</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Doses Missed</p>
          <p className="text-3xl font-bold text-danger">4</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">This Week</h2>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekStatus.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-white p-1.5 sm:gap-1.5 sm:p-3">
              <span className="text-[10px] font-semibold text-body sm:text-xs">{d.day}</span>
              <span className={`flex size-7 items-center justify-center rounded-full sm:size-9 ${dayIcon[d.status].bg}`}>
                {dayIcon[d.status].icon}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border bg-bg px-6 py-4">
          <h3 className="text-lg font-bold text-ink">Recent History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Medication</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentDoses.map((dose, i) => (
                <tr key={i} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                  <td className="px-6 py-3 text-sm text-body">{dose.date}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-ink">{dose.medication}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[dose.status]}`}>{dose.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
