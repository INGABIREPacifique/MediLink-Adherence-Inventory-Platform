import { Clock, RefreshCw, Check } from 'lucide-react';
import type { AlertStatus } from '../../types';

const styles: Record<AlertStatus, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
  pending: {
    bg: 'bg-danger-bg',
    text: 'text-danger-text',
    border: 'border-danger/20',
    icon: <span className="size-1.5 rounded-full bg-danger" />,
    label: 'Pending',
  },
  in_progress: {
    bg: 'bg-warning-bg',
    text: 'text-warning-text',
    border: 'border-warning-text/20',
    icon: <RefreshCw size={10} />,
    label: 'In Progress',
  },
  resolved: {
    bg: 'bg-success-bg',
    text: 'text-success-text',
    border: 'border-success/20',
    icon: <Check size={11} />,
    label: 'Resolved',
  },
};

export function StatusBadge({ status }: { status: AlertStatus }) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border px-[11px] py-[5px] text-xs font-semibold tracking-wide ${s.bg} ${s.text} ${s.border}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

export function DelayBadge({ minutesLabel, urgent }: { minutesLabel: string; urgent: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${urgent ? 'text-danger' : 'font-medium text-body'}`}>
      <Clock size={15} />
      {minutesLabel}
    </span>
  );
}
