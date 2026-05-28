import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Ticket, Employee } from '../../../core/models/models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-wrapper">
      @if (loading()) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else if (ticket()) {
        <div class="page-header">
          <div class="page-title-block">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
              <a routerLink="/tickets" class="back-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                Tickets
              </a>
              <span class="ticket-id-hero">{{ ticket()!.ticketNumber }}</span>
              <span class="status-badge" [class]="statusClass(ticket()!.currentStatus)">{{ formatStatus(ticket()!.currentStatus) }}</span>
              <span class="badge" [class]="priorityClass(ticket()!.priority)">{{ ticket()!.priority }}</span>
              @if (ticket()!.slaBreached) {
                <span class="sla-breach-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                  SLA BREACHED
                </span>
              } @else if (ticket()!.slaRemainingHours != null) {
                <span class="sla-ok-badge">{{ ticket()!.slaRemainingHours | number:'1.0-1' }}h SLA remaining</span>
              }
            </div>
          </div>
          @if (canEdit()) {
            <div class="page-actions">
              <a [routerLink]="['/tickets/edit', ticket()!.id]" class="btn btn-secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </a>
            </div>
          }
        </div>

        <div class="detail-grid">
          <!-- Main info -->
          <div class="detail-card span-full">
            <div class="card-label">Issue Description</div>
            <p class="issue-body">{{ ticket()!.issueDescription }}</p>
          </div>

          <!-- Ticket Details -->
          <div class="detail-card">
            <div class="card-label">Ticket Details</div>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-key">Project</span>
                <span class="info-val">{{ ticket()!.projectName }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Support Level</span>
                <span class="info-val">
                  @if (ticket()!.supportLevel) {
                    <span class="level-tag">{{ ticket()!.supportLevel }}</span>
                  } @else { — }
                </span>
              </div>
              <div class="info-row">
                <span class="info-key">Raised By</span>
                <span class="info-val">{{ ticket()!.raisedByUsername ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Created</span>
                <span class="info-val mono">{{ ticket()!.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Last Updated</span>
                <span class="info-val mono">{{ ticket()!.updatedAt | date:'dd MMM yyyy, HH:mm' }}</span>
              </div>
              @if (ticket()!.responseDatetime) {
                <div class="info-row">
                  <span class="info-key">First Response</span>
                  <span class="info-val mono">{{ ticket()!.responseDatetime | date:'dd MMM yyyy, HH:mm' }}</span>
                </div>
              }
              @if (ticket()!.resolutionTime) {
                <div class="info-row">
                  <span class="info-key">Resolution Time</span>
                  <span class="info-val resolution-time">{{ ticket()!.resolutionTime }}</span>
                </div>
              }
              @if (ticket()!.businessResolutionHours != null) {
                <div class="info-row">
                  <span class="info-key">Business Hours</span>
                  <span class="info-val resolution-time">{{ ticket()!.businessResolutionHours | number:'1.1-1' }}h</span>
                </div>
              }
            </div>
          </div>

          <!-- Assignment & Status -->
          <div class="detail-card">
            <div class="card-label">Assignment & Status</div>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-key">Assignee</span>
                <span class="info-val">
                  @if (ticket()!.assignedEmployeeName) {
                    <div class="assignee">
                      <div class="avatar" style="width:24px;height:24px;font-size:10px;border-radius:6px;">
                        {{ ticket()!.assignedEmployeeName!.slice(0,2).toUpperCase() }}
                      </div>
                      {{ ticket()!.assignedEmployeeName }}
                    </div>
                  } @else {
                    <span class="text-muted">Unassigned</span>
                  }
                </span>
              </div>
            </div>

            @if (canAssign()) {
              <!-- Quick assign -->
              <div class="quick-action-block">
                <label class="field-label">Quick Assign</label>
                <div style="display:flex;gap:8px">
                  <select class="field-select" [(ngModel)]="selectedEmployee" style="flex:1">
                    <option [ngValue]="null">Select employee</option>
                    @for (e of employees(); track e.id) {
                      <option [ngValue]="e.id">{{ e.employeeName }}</option>
                    }
                  </select>
                  <button class="btn btn-primary btn-sm" (click)="assignEmployee()" [disabled]="!selectedEmployee || assigning()">
                    {{ assigning() ? '...' : 'Assign' }}
                  </button>
                </div>
              </div>
            }

            @if (canUpdateStatus()) {
              <!-- Quick status update -->
              <div class="quick-action-block">
                <label class="field-label">Update Status</label>
                <div style="display:flex;gap:8px">
                  <select class="field-select" [(ngModel)]="selectedStatus" style="flex:1">
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <button class="btn btn-primary btn-sm" (click)="updateStatus()" [disabled]="updatingStatus()">
                    {{ updatingStatus() ? '...' : 'Update' }}
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- SLA Info -->
          <div class="detail-card">
            <div class="card-label">SLA & Timeline</div>
            @if (ticket()!.slaBreached) {
              <div class="sla-breach-panel">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div>
                  <div class="breach-title">SLA Breached</div>
                  <div class="breach-sub">This ticket has exceeded the SLA threshold</div>
                </div>
              </div>
            } @else if (ticket()!.slaRemainingHours != null) {
              <div class="sla-countdown">
                <div class="countdown-value">{{ ticket()!.slaRemainingHours | number:'1.1-1' }}h</div>
                <div class="countdown-label">Business hours remaining</div>
                <div class="sla-bar-wrap">
                  <div class="sla-bar" [style.width.%]="slaPercent()" [class.sla-critical]="(ticket()!.slaRemainingHours ?? 0) < 2"></div>
                </div>
              </div>
            } @else {
              <div class="text-muted" style="padding:12px 0">No SLA configured for this project.</div>
            }
          </div>

          <!-- Resolution -->
          @if (ticket()!.resolutionDetails) {
            <div class="detail-card span-full">
              <div class="card-label">Resolution Details</div>
              <p class="body-text">{{ ticket()!.resolutionDetails }}</p>
            </div>
          }

          @if (ticket()!.remarks) {
            <div class="detail-card span-full">
              <div class="card-label">Remarks</div>
              <p class="body-text">{{ ticket()!.remarks }}</p>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <p class="empty-title">Ticket not found</p>
          <a routerLink="/tickets" class="btn btn-primary">Back to Tickets</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-flex; align-items: center; gap: 5px;
      color: var(--text-muted); font-size: 13px; text-decoration: none;
      transition: color 0.15s;
    }
    .back-link:hover { color: var(--text-primary); }

    .sla-breach-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: var(--danger-light); color: var(--danger);
      border: 1px solid rgba(239,68,68,0.25);
      font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 4px;
      animation: pulse-red 2s ease infinite;
    }
    .sla-ok-badge {
      background: var(--success-light); color: var(--success);
      font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 4px;
    }
    @keyframes pulse-red { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }

    .quick-action-block { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }

    /* SLA countdown */
    .sla-countdown { text-align: center; padding: 16px 0; }
    .countdown-value { font-size: 40px; font-weight: 800; color: var(--text-primary); letter-spacing: -2px; line-height: 1; }
    .countdown-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; margin-bottom: 14px; }
    .sla-bar-wrap { height: 6px; background: var(--bg-primary); border-radius: 3px; overflow: hidden; }
    .sla-bar { height: 100%; background: var(--success); border-radius: 3px; transition: width 0.5s; }
    .sla-bar.sla-critical { background: var(--danger); }

    /* Breach panel */
    .sla-breach-panel {
      display: flex; align-items: flex-start; gap: 12px;
      background: var(--danger-light); border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px; padding: 14px; color: var(--danger);
    }
    .breach-title { font-size: 14px; font-weight: 700; }
    .breach-sub { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
  `]
})
export class TicketDetailComponent implements OnInit {
  ticket = signal<Ticket | null>(null);
  employees = signal<Employee[]>([]);
  loading = signal(true);
  assigning = signal(false);
  updatingStatus = signal(false);
  selectedEmployee: number | null = null;
  selectedStatus = 'OPEN';

  canEdit = computed(() => this.auth.hasRole('ADMIN', 'PROJECT_MANAGER', 'L1_SUPPORT', 'L2_SUPPORT'));
  canAssign = computed(() => this.auth.hasRole('ADMIN', 'PROJECT_MANAGER'));
  canUpdateStatus = computed(() => this.auth.hasRole('ADMIN', 'PROJECT_MANAGER', 'L1_SUPPORT', 'L2_SUPPORT'));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private employeeService: EmployeeService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTicket(+id);
  }

  private loadTicket(id: number): void {
    this.ticketService.getById(id).subscribe({
      next: t => {
        this.ticket.set(t);
        this.selectedStatus = t.currentStatus ?? 'OPEN';
        this.selectedEmployee = t.assignedEmployeeId ?? null;
        this.loading.set(false);
        if (t.projectId) {
          this.employeeService.getAllList(t.projectId).subscribe(e => this.employees.set(e));
        }
      },
      error: () => { this.loading.set(false); this.toast.error('Ticket not found.'); }
    });
  }

  assignEmployee(): void {
    if (!this.selectedEmployee || !this.ticket()?.id) return;
    this.assigning.set(true);
    this.ticketService.assignEmployee(this.ticket()!.id!, this.selectedEmployee).subscribe({
      next: t => { this.ticket.set(t); this.toast.success('Employee assigned.'); this.assigning.set(false); },
      error: () => { this.toast.error('Failed to assign.'); this.assigning.set(false); }
    });
  }

  updateStatus(): void {
    if (!this.ticket()?.id) return;
    this.updatingStatus.set(true);
    this.ticketService.updateStatus(this.ticket()!.id!, this.selectedStatus).subscribe({
      next: t => { this.ticket.set(t); this.toast.success('Status updated.'); this.updatingStatus.set(false); },
      error: () => { this.toast.error('Failed to update status.'); this.updatingStatus.set(false); }
    });
  }

  slaPercent(): number {
    const t = this.ticket();
    if (!t?.slaHours || t.slaRemainingHours == null) return 0;
    return Math.min(100, Math.max(0, (t.slaRemainingHours / t.slaHours) * 100));
  }

  priorityClass(p?: string): string {
    const map: Record<string, string> = { P1: 'badge-p1', P2: 'badge-p2', P3: 'badge-p3', P4: 'badge-p4' };
    return p ? (map[p] ?? '') : '';
  }

  statusClass(s?: string): string {
    const map: Record<string, string> = {
      OPEN: 'status-open', IN_PROGRESS: 'status-progress',
      ON_HOLD: 'status-hold', RESOLVED: 'status-resolved', CLOSED: 'status-closed'
    };
    return s ? (map[s] ?? '') : '';
  }

  formatStatus(s?: string): string { return s ? s.replace(/_/g, ' ') : '—'; }
}
