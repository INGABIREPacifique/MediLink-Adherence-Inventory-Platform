import { mockAlertsService } from './mockAlertsService';
import { mockInventoryService } from './mockInventoryService';
import { mockRulesService } from './mockRulesService';
import { mockHandoverService } from './mockHandoverService';
import { mockPerformanceService } from './mockPerformanceService';
import type { AlertsService } from './alertsService';
import type { InventoryService } from './inventoryService';
import type { RulesService } from './rulesService';
import type { HandoverService } from './handoverService';
import type { PerformanceService } from './performanceService';

// Swap point for Supabase: once the backend is ready, implement each
// *Service interface against Supabase (e.g. `src/services/supabaseAlertsService.ts`)
// and change the line below. No page or component should import a mock*Service directly.
export const alertsService: AlertsService = mockAlertsService;
export const inventoryService: InventoryService = mockInventoryService;
export const rulesService: RulesService = mockRulesService;
export const handoverService: HandoverService = mockHandoverService;
export const performanceService: PerformanceService = mockPerformanceService;
