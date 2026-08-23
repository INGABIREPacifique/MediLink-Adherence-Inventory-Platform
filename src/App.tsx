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
import PatientDirectory from './pages/PatientDirectory';
import PatientHistoryPage from './pages/PatientHistory';
import HelpGuide from './pages/HelpGuide';

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
            <Route path="/patients" element={<PatientDirectory />} />
            <Route path="/patients/:patientId" element={<PatientHistoryPage />} />
            <Route path="/help" element={<HelpGuide />} />
          </Routes>
        </AppShell>
      </ProtectedRoute>
    </BrowserRouter>
  );
}
