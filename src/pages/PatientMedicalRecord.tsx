import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Stethoscope, Pill, Plus, Trash2, Download } from 'lucide-react';
import { getDischargeSummary, type DischargeSummaryData } from '../services/supabaseDischargeService';
import { getPatientHistory, updatePatientAllergies, getConditions, addCondition as addConditionApi, removeCondition as removeConditionApi } from '../services/supabasePatientHistoryService';

// A single aggregated "Medical Record History" view for a nurse -- pulls
// together the pieces that already exist as real Supabase data
// (prescriptions/medications via getDischargeSummary, adherence context via
// getPatientHistory) plus Allergies and Conditions/Diagnoses.
//
// Both allergies (migration 0015) and conditions (migration 0016) now
// persist to Supabase. If migration 0016 hasn't been run yet, the
// conditions calls below will error -- intentional, rather than silently
// falling back to fake local-only state.
//
// This is also the single source that the Patient Portal's read-only
// Medical Records page (src/pages/patient/PatientMedicalRecords.tsx) is
// designed to mirror.

interface ConditionEntry {
  id: string;
  name: string;
  diagnosedOn?: string | null;
}

export default function PatientMedicalRecord() {
  const { patientId } = useParams<{ patientId: string }>();
  const [summary, setSummary] = useState<DischargeSummaryData | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [conditions, setConditions] = useState<ConditionEntry[]>([]);
  const [conditionInput, setConditionInput] = useState('');
  const [conditionsError, setConditionsError] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([getDischargeSummary(patientId), getPatientHistory(patientId)])
      .then(([dischargeSummary, history]) => {
        setSummary(dischargeSummary);
        setPatientName(history.patient.name);
        setPatientPhone(history.patient.phone);
        setAllergies(history.patient.knownAllergies);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    getConditions(patientId)
      .then(setConditions)
      .catch(() => setConditionsError(true)); // Likely means migration 0016 hasn't been run yet
  }, [patientId]);

  async function addAllergy() {
    const value = allergyInput.trim();
    if (!value || allergies.some((a) => a.toLowerCase() === value.toLowerCase()) || !patientId) {
      setAllergyInput('');
      return;
    }
    const next = [...allergies, value];
    setAllergies(next);
    setAllergyInput('');
    await updatePatientAllergies(patientId, next);
  }

  async function removeAllergy(value: string) {
    if (!patientId) return;
    const next = allergies.filter((a) => a !== value);
    setAllergies(next);
    await updatePatientAllergies(patientId, next);
  }

  async function addCondition() {
    const value = conditionInput.trim();
    if (!value || !patientId) return;
    setConditionInput('');
    try {
      const created = await addConditionApi(patientId, value);
      setConditions((c) => [...c, created]);
    } catch {
      setConditionsError(true);
    }
  }

  async function removeCondition(id: string) {
    try {
      await removeConditionApi(id);
      setConditions((list) => list.filter((x) => x.id !== id));
    } catch {
      setConditionsError(true);
    }
  }

  if (loading) return <div className="text-body">Loading medical record…</div>;
  if (!summary) return <div className="text-body">No record found for this patient.</div>;

  return (
    <div className="flex flex-col gap-6">
      <Link to={patientId ? `/patients/${patientId}` : '/patients'} className="flex w-fit items-center gap-2 text-sm font-semibold text-navy-light">
        <ArrowLeft size={15} />
        Back to Patient History
      </Link>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">{patientName}'s Medical Record</h1>
          <p className="text-body">{patientPhone}</p>
        </div>
        <button
          type="button"
          disabled
          title="Full patient-portable export (PDF/QR) is a backend follow-up, once allergies and conditions are persisted"
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-body opacity-50"
        >
          <Download size={15} />
          Export Full Record
        </button>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <p className="flex items-center gap-2 text-lg font-bold text-navy">
          <ShieldAlert size={18} />
          Known Allergies
        </p>
        <p className="mt-1 text-xs text-body">Visible read-only to the patient in their Patient Portal. Checked against new prescriptions at enrollment.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {allergies.length === 0 && <span className="text-sm text-body">None recorded.</span>}
          {allergies.map((a) => (
            <span key={a} className="flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger-bg/40 px-3 py-1 text-xs font-semibold text-danger-text">
              {a}
              <button type="button" onClick={() => removeAllergy(a)} aria-label={`Remove ${a}`} className="text-danger-text hover:opacity-70">
                <Trash2 size={11} />
              </button>
            </span>
          ))}
          <input
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(); } }}
            placeholder="Add allergy — press Enter"
            className="min-w-[200px] flex-1 rounded border border-border bg-bg px-3 py-2 text-sm font-normal text-ink"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <p className="flex items-center gap-2 text-lg font-bold text-navy">
          <Stethoscope size={18} />
          Conditions &amp; Diagnoses
        </p>
        <p className="mt-1 text-xs text-body">
          {conditionsError ? 'Could not load conditions — confirm migration 0016 has been run.' : 'Persists to Supabase.'}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {conditions.length === 0 && <span className="text-sm text-body">None recorded.</span>}
          {conditions.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded border border-border bg-bg px-3 py-2">
              <span className="text-sm font-semibold text-ink">{c.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-body">Since {c.diagnosedOn}</span>
                <button type="button" onClick={() => removeCondition(c.id)} aria-label={`Remove ${c.name}`} className="text-danger hover:opacity-70">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <div className="mt-1 flex gap-2">
            <input
              value={conditionInput}
              onChange={(e) => setConditionInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCondition(); } }}
              placeholder="e.g. Type 2 Diabetes"
              className="flex-1 rounded border border-border bg-bg px-3 py-2 text-sm font-normal text-ink"
            />
            <button type="button" onClick={addCondition} className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white">
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <p className="flex items-center gap-2 text-lg font-bold text-navy">
          <Pill size={18} />
          Medication History
        </p>
        <p className="mt-1 text-xs text-body">Real data from this patient's prescriptions and dose confirmations.</p>
        <div className="mt-3 flex flex-col gap-2">
          {summary.medications.map((m) => (
            <div key={m.name} className="flex items-center justify-between rounded border border-border bg-bg px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-ink">{m.name}</p>
                <p className="text-xs text-body">{m.dosage} — {m.frequency}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${m.completed ? 'bg-success-bg text-success-text' : 'bg-warning-bg text-warning-text'}`}>
                {m.completed ? 'Course completed' : 'In progress'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 text-sm font-semibold text-navy-light">
        <Link to={`/patients/${patientId}`} className="rounded-lg border border-border bg-white px-4 py-2.5 shadow-sm">Adherence History</Link>
        <Link to={`/discharge-summary/${patientId}`} className="rounded-lg border border-border bg-white px-4 py-2.5 shadow-sm">Discharge Summary</Link>
      </div>
    </div>
  );
}
