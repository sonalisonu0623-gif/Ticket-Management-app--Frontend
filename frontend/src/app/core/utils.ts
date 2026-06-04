import { Ticket } from '../models';

export function priorityClass(p?: string): string {
  if (!p) return 'badge-p4';
  if (p.startsWith('P1')) return 'badge-p1';
  if (p.startsWith('P2')) return 'badge-p2';
  if (p.startsWith('P3')) return 'badge-p3';
  return 'badge-p4';
}

export function statusClass(s?: string): string {
  const map: Record<string, string> = {
    'Open': 'status-open', 'In Progress': 'status-progress',
    'Pending': 'status-pending', 'Resolved': 'status-resolved',
    'Closed': 'status-closed', 'Escalated': 'status-escalated'
  };
  return map[s ?? ''] ?? 'status-open';
}

export function formatDate(d?: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(d?: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function initials(name: string): string {
  return (name ?? 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function roleLabel(role?: string): string {
  const map: Record<string, string> = {
    ADMIN: 'Admin', PROJECT_MANAGER: 'PM',
    L1_SUPPORT: 'L1', L2_SUPPORT: 'L2', L3_SUPPORT: 'L3', USER: 'User'
  };
  return map[role ?? ''] ?? 'User';
}

export function roleClass(role?: string): string {
  const map: Record<string, string> = {
    ADMIN: 'role-admin', PROJECT_MANAGER: 'role-pm',
    L1_SUPPORT: 'role-l1', L2_SUPPORT: 'role-l2', L3_SUPPORT: 'role-l3', USER: 'role-user'
  };
  return map[role ?? ''] ?? 'role-user';
}

/** Compute SLA info from a ticket */
export function slaInfo(ticket: Ticket, defaultSlaHours = 24): {
  breached: boolean; label: string; remaining: number; percentage: number;
} {
  const slaHours  = defaultSlaHours;
  const breached  = ticket.slaBreached ?? false;
  const remaining = ticket.slaRemainingHours ?? 0;
  const elapsed   = slaHours - remaining;
  const pct       = Math.min(100, Math.max(0, (elapsed / slaHours) * 100));

  let label: string;
  if (ticket.currentStatus === 'Resolved' || ticket.currentStatus === 'Closed') {
    label = breached ? 'Breached' : 'Met';
  } else if (breached) {
    label = `Overdue ${Math.abs(remaining)}h`;
  } else {
    label = `${remaining}h left`;
  }
  return { breached, label, remaining, percentage: Math.round(pct) };
}

export function truncate(text: string | undefined, len = 70): string {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '…' : text;
}
