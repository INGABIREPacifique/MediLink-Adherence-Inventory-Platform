import type { PerformanceService } from './performanceService';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockPerformanceService: PerformanceService = {
  async getToday() {
    await delay();
    return {
      date: new Date().toISOString().slice(0, 10),
      adherenceRatePct: 87,
      escalationsToday: 4,
      followUpsAttendedPct: 92,
    };
  },
};
