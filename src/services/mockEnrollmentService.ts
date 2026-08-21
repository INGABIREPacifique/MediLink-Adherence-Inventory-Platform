import type { EnrollmentDraft } from '../types';
import type { EnrollmentService } from './enrollmentService';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
let count = 0;

export const mockEnrollmentService: EnrollmentService = {
  async enrollPatient(draft: EnrollmentDraft) {
    await delay();
    count += 1;
    return { id: `p-new-${count}`, name: draft.patientName, phone: draft.phone };
  },
};
