import { supabaseAlertsService } from './supabaseAlertsService';
import { supabaseInventoryService } from './supabaseInventoryService';
import { supabaseRulesService } from './supabaseRulesService';
import { supabaseHandoverService } from './supabaseHandoverService';
import { supabasePerformanceService } from './supabasePerformanceService';
import { supabaseEnrollmentService } from './supabaseEnrollmentService';
import type { AlertsService } from './alertsService';
import type { InventoryService } from './inventoryService';
import type { RulesService } from './rulesService';
import type { HandoverService } from './handoverService';
import type { PerformanceService } from './performanceService';
import type { EnrollmentService } from './enrollmentService';

// All six pilot domains are now wired to real Supabase tables. No page or
// component should import a mock*Service or supabase*Service directly --
// always import from here, so any future swap is a one-line change.
export const alertsService: AlertsService = supabaseAlertsService;
export const inventoryService: InventoryService = supabaseInventoryService;
export const rulesService: RulesService = supabaseRulesService;
export const handoverService: HandoverService = supabaseHandoverService;
export const performanceService: PerformanceService = supabasePerformanceService;
export const enrollmentService: EnrollmentService = supabaseEnrollmentService;
