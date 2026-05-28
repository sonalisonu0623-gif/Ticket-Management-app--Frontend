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

export const PRIORITY_DISPLAY: Record<string, string> = {
  P1_CRITICAL: 'P1 – Critical',
  P2_HIGH:     'P2 – High',
  P3_MEDIUM:   'P3 – Medium',
  P4_LOW:      'P4 – Low',
};
