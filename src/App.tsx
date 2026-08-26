import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuth } from './lib/AuthContext';
import EscalationInbox from './pages/EscalationInbox';
import WardInventory from './pages/WardInventory';
import StaffRegistration from './pages/StaffRegistration';
import EscalationRulesConfig from './pages/EscalationRulesConfig';
import ShiftHandover from './pages/ShiftHandover';
import DailyPerformanceReport from './pages/DailyPerformanceReport';
import PatientDischargeSummary from './pages/PatientDischargeSummary';
import AIForecasting from './pages/AIForecasting';
import UssdSimulator from './pages/UssdSimulator';
import ChwHome from './pages/chw/ChwHome';
import ChwPatients from './pages/chw/ChwPatients';
import ChwVisitLog from './pages/chw/ChwVisitLog';
import ChwLocalInventory from './pages/chw/ChwLocalInventory';
import ChwTraining from './pages/chw/ChwTraining';
import { PatientPortalLayout } from './components/patient/PatientPortalLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientMedications from './pages/patient/PatientMedications';
import PatientAdherence from './pages/patient/PatientAdherence';
import PatientReports from './pages/patient/PatientReports';
import PatientSettings from './pages/patient/PatientSettings';
import { MinistryLayout } from './components/ministry/MinistryLayout';
import MinistryDashboard from './pages/ministry/MinistryDashboard';
import MinistryClinical from './pages/ministry/MinistryClinical';
import MinistrySectorReports from './pages/ministry/MinistrySectorReports';
import MinistryNationalExport from './pages/ministry/MinistryNationalExport';
import MinistryReportApproval from './pages/ministry/MinistryReportApproval';
import PatientDirectory from './pages/PatientDirectory';
import PatientHistoryPage from './pages/PatientHistory';
import HelpGuide from './pages/HelpGuide';
import AuditLog from './pages/AuditLog';
import PilotFeedbackLog from './pages/PilotFeedbackLog';
import SupervisorDashboard from './pages/SupervisorDashboard';

// "/" renders a different screen depending on the logged-in user's role --
// same desktop shell for everyone, role-based content, per direction:
// "built it as desktop but for roles of CHW... different components or
// navbar" rather than a separate mobile app.
function RoleAwareHome() {
  const { profile } = useAuth();
  if (profile?.role === 'chw') return <ChwHome />;
  return <EscalationInbox />;
}

// Pilot-phase routes only, matching MediLink_Rwanda.docx §2 scope and the
// Figma "MVP-" screens. Full-platform routes (Ministry, Research Portal,
// Sector Analytics, etc.) are Phase 3+/4 — intentionally not routed yet.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Patient Portal -- FRONTEND ONLY, deliberately NOT behind
            ProtectedRoute (which gates staff Supabase auth). A real patient
            login (phone + OTP, not email/password) is the backend phase
            for this batch, not built yet -- see PatientPortalLayout.tsx. */}
        <Route path="/patient" element={<PatientPortalLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="medications" element={<PatientMedications />} />
          <Route path="adherence" element={<PatientAdherence />} />
          <Route path="reports" element={<PatientReports />} />
          <Route path="settings" element={<PatientSettings />} />
        </Route>

        {/* Ministry/Health Authority tier -- FRONTEND ONLY, same reasoning
            as Patient Portal: a real district/national official login is
            a distinct auth tier, backend phase not started. */}
        <Route path="/ministry" element={<MinistryLayout />}>
          <Route index element={<MinistryDashboard />} />
          <Route path="clinical" element={<MinistryClinical />} />
          <Route path="reports" element={<MinistrySectorReports />} />
          <Route path="national-export" element={<MinistryNationalExport />} />
          <Route path="report-approval" element={<MinistryReportApproval />} />
        </Route>

        {/* Staff/CHW app -- everything below stays behind real Supabase auth. */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<RoleAwareHome />} />
                  <Route path="/inventory" element={<WardInventory />} />
                  <Route path="/enrollment" element={<StaffRegistration />} />
                  <Route path="/handover" element={<ShiftHandover />} />
                  <Route path="/discharge-summary" element={<PatientDischargeSummary />} />
                  <Route path="/discharge-summary/:patientId" element={<PatientDischargeSummary />} />
                  <Route path="/forecasting" element={<AIForecasting />} />
                  <Route path="/ussd-simulator" element={<UssdSimulator />} />
                  <Route path="/reports" element={<DailyPerformanceReport />} />
                  <Route path="/settings" element={<EscalationRulesConfig />} />
                  <Route path="/chw/patients" element={<ChwPatients />} />
                  <Route path="/chw/visit-log" element={<ChwVisitLog />} />
                  <Route path="/chw/inventory" element={<ChwLocalInventory />} />
                  <Route path="/chw/training" element={<ChwTraining />} />
                  <Route path="/patients" element={<PatientDirectory />} />
                  <Route path="/patients/:patientId" element={<PatientHistoryPage />} />
                  <Route path="/help" element={<HelpGuide />} />
                  <Route path="/audit-log" element={<AuditLog />} />
                  <Route path="/feedback" element={<PilotFeedbackLog />} />
                  <Route path="/supervisor" element={<SupervisorDashboard />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
