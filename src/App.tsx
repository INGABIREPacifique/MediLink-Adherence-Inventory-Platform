import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import EscalationInbox from './pages/EscalationInbox';
import WardInventory from './pages/WardInventory';
import StaffRegistration from './pages/StaffRegistration';
import EscalationRulesConfig from './pages/EscalationRulesConfig';
import ShiftHandover from './pages/ShiftHandover';
import DailyPerformanceReport from './pages/DailyPerformanceReport';
import PatientDischargeSummary from './pages/PatientDischargeSummary';
import AIForecasting from './pages/AIForecasting';

// Pilot-phase routes only, matching MediLink_Rwanda.docx §2 scope and the
// Figma "MVP-" screens. Full-platform routes (Ministry, Research Portal,
// Sector Analytics, etc.) are Phase 3+/4 — intentionally not routed yet.
export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<EscalationInbox />} />
          <Route path="/inventory" element={<WardInventory />} />
          <Route path="/enrollment" element={<StaffRegistration />} />
          <Route path="/handover" element={<ShiftHandover />} />
          <Route path="/discharge-summary" element={<PatientDischargeSummary />} />
          <Route path="/forecasting" element={<AIForecasting />} />
          <Route path="/reports" element={<DailyPerformanceReport />} />
          <Route path="/settings" element={<EscalationRulesConfig />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
