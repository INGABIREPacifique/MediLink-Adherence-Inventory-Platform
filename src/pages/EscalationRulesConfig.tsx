import { useEffect, useState } from 'react';
import { rulesService } from '../services';
import type { EscalationRules } from '../types';

export default function EscalationRulesConfig() {
  const [rules, setRules] = useState<EscalationRules | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    rulesService.getRules().then(setRules);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!rules) return;
    setSaving(true);
    const updated = await rulesService.updateRules({
      missedDoseWindowMinutes: rules.missedDoseWindowMinutes,
      secondReminderDelayMinutes: rules.secondReminderDelayMinutes,
    });
    setRules(updated);
    setSavedAt(updated.updatedAt);
    setSaving(false);
  }

  if (!rules) return <div className="text-body">Loading rules…</div>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-base text-ink">Escalation Rules Configuration</h2>
        <p className="max-w-xl text-base text-body">
          Applies to all patients enrolled at this facility. Missed-dose trigger stays rule-based —
          only the priority ranking once escalated is AI-assisted.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex max-w-md flex-col gap-5 rounded-lg border border-border bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Missed-dose escalation window (minutes)
          <input
            type="number"
            value={rules.missedDoseWindowMinutes}
            onChange={(e) => setRules({ ...rules, missedDoseWindowMinutes: Number(e.target.value) })}
            className="rounded border border-border px-3 py-2 text-base font-normal text-ink"
          />
          <span className="text-xs font-normal text-body">Default: 240 (4 hours), per pilot protocol</span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Second reminder delay (minutes)
          <input
            type="number"
            value={rules.secondReminderDelayMinutes}
            onChange={(e) => setRules({ ...rules, secondReminderDelayMinutes: Number(e.target.value) })}
            className="rounded border border-border px-3 py-2 text-base font-normal text-ink"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="mt-1 w-fit rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Rules'}
        </button>

        {savedAt && <p className="text-xs text-success-text">Saved {new Date(savedAt).toLocaleTimeString()}</p>}
      </form>
    </div>
  );
}
