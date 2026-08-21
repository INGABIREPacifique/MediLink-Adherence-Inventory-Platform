import { supabaseAlertsService } from './supabaseAlertsService';
import { supabaseInventoryService } from './supabaseInventoryService';
import { mockRulesService } from './mockRulesService';
import { mockHandoverService } from './mockHandoverService';
import { mockPerformanceService } from './mockPerformanceService';
import type { AlertsService } from './alertsService';
import type { InventoryService } from './inventoryService';
import type { RulesService } from './rulesService';
import type { HandoverService } from './handoverService';
import type { PerformanceService } from './performanceService';

// Swap point for Supabase: Escalation Inbox and Ward Inventory are now
// wired to real Supabase tables (supabase/migrations/0001_init.sql +
// 0003_seed_demo_data.sql). Rules/Handover/Performance are still mock --
// implement supabaseRulesService.ts etc. against the same tables and swap
// the export below when ready. No page or component should import a
// mock*Service or supabase*Service directly -- always import from here.
export const alertsService: AlertsService = supabaseAlertsService;
export const inventoryService: InventoryService = supabaseInventoryService;
export const rulesService: RulesService = mockRulesService;
export const handoverService: HandoverService = mockHandoverService;
export const performanceService: PerformanceService = mockPerformanceService;
