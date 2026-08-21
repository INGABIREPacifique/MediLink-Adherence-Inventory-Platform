import type { EscalationRules } from '../types';

export interface RulesService {
  getRules(): Promise<EscalationRules>;
  updateRules(rules: Partial<Pick<EscalationRules, 'missedDoseWindowMinutes' | 'secondReminderDelayMinutes'>>): Promise<EscalationRules>;
}
