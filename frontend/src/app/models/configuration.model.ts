export interface ShiftHours {
  id?: number;
  shiftName: string;
  startTime: string;   // HH:mm
  endTime: string;
  isActive: boolean;
}

export interface Holiday {
  id?: number;
  holidayName: string;
  holidayDate: string; // YYYY-MM-DD
  description?: string;
}

export interface SlaConfig {
  id?: number;
  priority: string;
  supportLevel: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  isActive: boolean;
}

export const SLA_PRIORITIES = ['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'];
export const SLA_SUPPORT_LEVELS = ['L1', 'L2', 'L3'];
