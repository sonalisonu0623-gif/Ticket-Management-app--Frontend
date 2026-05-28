export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id?: number;
  projectCode: string;
  projectName: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectRequest {
  projectCode: string;
  projectName: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};
