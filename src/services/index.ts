import { mockAlertsService } from './mockAlertsService';
import type { AlertsService } from './alertsService';

// Swap point for Supabase: once the backend is ready, implement AlertsService
// against Supabase (e.g. `src/services/supabaseAlertsService.ts`) and change
// this one line. No page or component should import mockAlertsService directly.
export const alertsService: AlertsService = mockAlertsService;
