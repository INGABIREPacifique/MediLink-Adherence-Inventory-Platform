import type { EscalationRules } from '../types';
import type { RulesService } from './rulesService';

let rules: EscalationRules = {
  facilityId: 'kigali-central-internal-medicine',
  missedDoseWindowMinutes: 240, // 4 hours, per pilot protocol default
  secondReminderDelayMinutes: 60,
  updatedBy: 'System Default',
  updatedAt: new Date().toISOString(),
};

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockRulesService: RulesService = {
  async getRules() {
    await delay();
    return rules;
  },
  async updateRules(update) {
    await delay(150);
    rules = { ...rules, ...update, updatedBy: 'Ward Admin', updatedAt: new Date().toISOString() };
    return rules;
  },
};
