import type { DailyPerformance } from '../types';

export interface PerformanceService {
  getToday(): Promise<DailyPerformance>;
}
