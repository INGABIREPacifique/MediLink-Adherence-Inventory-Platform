import type { EnrollmentDraft, Patient } from '../types';

export interface EnrollmentService {
  enrollPatient(draft: EnrollmentDraft, assignedChwId?: string | null): Promise<Patient>;
}
