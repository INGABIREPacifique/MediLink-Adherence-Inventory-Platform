import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import EscalationInbox from './pages/EscalationInbox';
import ComingSoon from './pages/ComingSoon';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<EscalationInbox />} />
          <Route path="/inventory" element={<ComingSoon title="Ward Inventory" />} />
          <Route path="/forecasting" element={<ComingSoon title="AI Forecasting" />} />
          <Route path="/reports" element={<ComingSoon title="Reports" />} />
          <Route path="/settings" element={<ComingSoon title="Settings" />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
