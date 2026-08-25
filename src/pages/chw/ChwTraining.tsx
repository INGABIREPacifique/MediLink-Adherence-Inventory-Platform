import { useEffect, useState } from 'react';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { TRAINING_MODULES, getCompletedModules, completeModule } from '../../services/supabaseTrainingService';

// Matches Figma "CHW Training & Onboarding Portal" -- real progress bar
// and sequential module unlocking, backed by an actual chw_training_progress
// table instead of the mockup's static "3/5 Modules" / "45 Points" numbers.
export default function ChwTraining() {
  const { profile } = useAuth();
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    getCompletedModules(profile.id).then((c) => {
      setCompleted(c);
      setLoading(false);
    });
  }, [profile]);

  async function handleComplete(moduleKey: string) {
    if (!profile) return;
    await completeModule(profile.id, moduleKey);
    setCompleted((prev) => [...prev, moduleKey]);
  }

  if (loading) return <div className="text-body">Loading training progress…</div>;

  const progressPct = Math.round((completed.length / TRAINING_MODULES.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">CHW Training Portal</h1>
        <p className="text-body">Onboarding modules for using MediLink in the field.</p>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between text-sm font-semibold text-body">
          <span>Your Progress</span>
          <span>{completed.length}/{TRAINING_MODULES.length} Modules</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-row-alt">
          <div className="h-full bg-navy transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {TRAINING_MODULES.map((mod, i) => {
          const isDone = completed.includes(mod.key);
          const isLocked = i > 0 && !completed.includes(TRAINING_MODULES[i - 1].key);
          return (
            <div key={mod.key} className={`rounded-lg border p-4 shadow-sm ${isDone ? 'border-success/30 bg-success-bg/20' : 'border-border bg-white'} ${isLocked ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${isDone ? 'bg-success text-white' : isLocked ? 'bg-row-alt text-body' : 'bg-[#d7e2ff] text-navy'}`}>
                    {isDone ? <CheckCircle2 size={18} /> : isLocked ? <Lock size={16} /> : <PlayCircle size={18} />}
                  </span>
                  <div>
                    <p className="font-bold text-ink">Module {i + 1}: {mod.title}</p>
                    <p className="text-sm text-body">{mod.description}</p>
                    <p className="mt-0.5 text-xs text-body">Est. {mod.estMinutes} mins</p>
                  </div>
                </div>
              </div>
              {!isLocked && !isDone && (
                <button onClick={() => handleComplete(mod.key)} className="mt-3 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
                  Mark as Complete
                </button>
              )}
              {isDone && <span className="mt-3 inline-block rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">Completed</span>}
              {isLocked && <p className="mt-3 text-xs text-body">Complete the previous module to unlock.</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
