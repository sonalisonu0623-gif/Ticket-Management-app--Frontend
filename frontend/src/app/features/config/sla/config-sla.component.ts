import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlaService } from '../../../core/services/sla.service';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { SlaConfig, Project } from '../../../core/models/models';

@Component({
  selector: 'app-config-sla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">SLA Configuration</h1>
          <p class="page-subtitle">Define response and resolution SLAs per project and priority</p>
        </div>
      </div>

      <!-- Project selector -->
      <div class="project-tabs">
        @for (p of projects(); track p.id) {
          <button
            class="project-tab"
            [class.active]="selectedProject()?.id === p.id"
            (click)="selectProject(p)"
          >
            {{ p.projectName }}
          </button>
        }
      </div>

      @if (!selectedProject()) {
        <div class="empty-state" style="margin-top:40px">
          <p class="empty-title">Select a project</p>
          <p class="empty-sub">Choose a project from the tabs above to configure its SLA</p>
        </div>
      } @else if (loading()) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else {
        <!-- SLA Table -->
        <div class="sla-table-card">
          <div class="sla-table-header">
            <div class="sla-th priority-col">Priority</div>
            <div class="sla-th">Response Time (hrs)</div>
            <div class="sla-th">Resolution Time (hrs)</div>
            <div class="sla-th">Escalation</div>
            <div class="sla-th">Escalate After (hrs)</div>
            <div class="sla-th actions-col">Save</div>
          </div>

          @for (config of slaConfigs(); track config.priority) {
            <div class="sla-row" [class]="'prio-row-' + config.priority.toLowerCase()">
              <div class="sla-td priority-col">
                <span class="badge" [class]="priorityClass(config.priority)">{{ config.priority }}</span>
                <span class="prio-desc">{{ priorityDesc(config.priority) }}</span>
              </div>
              <div class="sla-td">
                <input
                  type="number" class="sla-input"
                  [(ngModel)]="config.responseHours"
                  min="0.5" step="0.5"
                  [ngModelOptions]="{standalone: true}"
                />
                <span class="unit">hrs</span>
              </div>
              <div class="sla-td">
                <input
                  type="number" class="sla-input"
                  [(ngModel)]="config.resolutionHours"
                  min="1" step="0.5"
                  [ngModelOptions]="{standalone: true}"
                />
                <span class="unit">hrs</span>
              </div>
              <div class="sla-td">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="config.escalationEnabled" [ngModelOptions]="{standalone: true}" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="sla-td">
                @if (config.escalationEnabled) {
                  <input
                    type="number" class="sla-input"
                    [(ngModel)]="config.escalationAfterHours"
                    min="1" step="0.5"
                    [ngModelOptions]="{standalone: true}"
                  />
                  <span class="unit">hrs</span>
                } @else {
                  <span class="text-muted">—</span>
                }
              </div>
              <div class="sla-td actions-col">
                <button class="btn btn-primary btn-sm" (click)="saveConfig(config)" [disabled]="saving()">
                  Save
                </button>
              </div>
            </div>
          }
        </div>

        <!-- SLA Legend -->
        <div class="sla-legend-card">
          <h3 class="legend-title">SLA Policy Summary</h3>
          <div class="legend-grid">
            @for (config of slaConfigs(); track config.priority) {
              <div class="legend-item-card" [class]="'legend-' + config.priority.toLowerCase()">
                <div class="legend-priority">{{ config.priority }}</div>
                <div class="legend-desc">{{ priorityDesc(config.priority) }}</div>
                <div class="legend-sla-row">
                  <span>Response</span>
                  <strong>{{ config.responseHours }}h</strong>
                </div>
                <div class="legend-sla-row">
                  <span>Resolution</span>
                  <strong>{{ config.resolutionHours }}h</strong>
                </div>
                @if (config.escalationEnabled) {
                  <div class="legend-escalate">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>
                    Escalates after {{ config.escalationAfterHours }}h
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .project-tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 6px; }
    .project-tab { padding: 7px 16px; border-radius: 7px; border: none; background: none; color: var(--text-secondary); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: inherit; }
    .project-tab:hover { background: var(--nav-hover); color: var(--text-primary); }
    .project-tab.active { background: var(--accent); color: white; }

    /* SLA Table */
    .sla-table-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
    .sla-table-header { display: grid; grid-template-columns: 140px 1fr 1fr 120px 1fr 100px; gap: 0; padding: 10px 16px; background: var(--bg-secondary); border-bottom: 1px solid var(--border); }
    .sla-th { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

    .sla-row { display: grid; grid-template-columns: 140px 1fr 1fr 120px 1fr 100px; gap: 0; padding: 14px 16px; border-bottom: 1px solid var(--border); align-items: center; transition: background 0.1s; }
    .sla-row:last-child { border-bottom: none; }
    .sla-row:hover { background: var(--bg-card-hover); }

    .sla-td { display: flex; align-items: center; gap: 6px; }

    .priority-col { flex-direction: column; align-items: flex-start; gap: 3px; }
    .prio-desc { font-size: 11px; color: var(--text-muted); }

    .sla-input { width: 70px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; color: var(--text-primary); font-size: 13.5px; outline: none; transition: border-color 0.15s; font-family: inherit; text-align: center; }
    .sla-input:focus { border-color: var(--border-focus); }
    .unit { font-size: 12px; color: var(--text-muted); }

    /* Toggle */
    .toggle-switch { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
    .toggle-switch input { display: none; }
    .toggle-slider { width: 36px; height: 20px; background: var(--border); border-radius: 10px; transition: background 0.2s; position: relative; }
    .toggle-slider::after { content: ''; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: white; transition: transform 0.2s; }
    .toggle-switch input:checked + .toggle-slider { background: var(--accent); }
    .toggle-switch input:checked + .toggle-slider::after { transform: translateX(16px); }

    /* Legend */
    .sla-legend-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
    .legend-title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }
    .legend-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .legend-item-card { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 9px; padding: 14px; }
    .legend-priority { font-size: 18px; font-weight: 800; margin-bottom: 2px; }
    .legend-p1 .legend-priority { color: var(--danger); }
    .legend-p2 .legend-priority { color: var(--warning); }
    .legend-p3 .legend-priority { color: #eab308; }
    .legend-p4 .legend-priority { color: var(--success); }
    .legend-desc { font-size: 11.5px; color: var(--text-muted); margin-bottom: 10px; }
    .legend-sla-row { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-secondary); padding: 3px 0; }
    .legend-sla-row strong { color: var(--text-primary); }
    .legend-escalate { margin-top: 8px; font-size: 11.5px; color: var(--warning); display: flex; align-items: center; gap: 4px; }

    @media (max-width: 900px) {
      .sla-table-header, .sla-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ConfigSlaComponent implements OnInit {
  projects = signal<Project[]>([]);
  slaConfigs = signal<SlaConfig[]>([]);
  selectedProject = signal<Project | null>(null);
  loading = signal(false);
  saving = signal(false);

  private readonly priorities = ['P1', 'P2', 'P3', 'P4'] as const;
  private readonly defaults: Record<string, { response: number; resolution: number }> = {
    P1: { response: 1, resolution: 4 },
    P2: { response: 4, resolution: 8 },
    P3: { response: 8, resolution: 24 },
    P4: { response: 24, resolution: 72 }
  };

  constructor(
    private slaService: SlaService,
    private projectService: ProjectService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.projectService.getAllList().subscribe(p => this.projects.set(p));
  }

  selectProject(p: Project): void {
    this.selectedProject.set(p);
    this.loadConfigs(p.id!);
  }

  private loadConfigs(projectId: number): void {
    this.loading.set(true);
    this.slaService.getConfigs(projectId).subscribe({
      next: configs => {
        // Ensure all 4 priorities exist
        const merged = this.priorities.map(priority => {
          const existing = configs.find(c => c.priority === priority);
          return existing ?? {
            projectId,
            priority,
            responseHours: this.defaults[priority].response,
            resolutionHours: this.defaults[priority].resolution,
            escalationEnabled: false
          } as SlaConfig;
        });
        this.slaConfigs.set(merged);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  saveConfig(config: SlaConfig): void {
    this.saving.set(true);
    this.slaService.upsertConfig(config).subscribe({
      next: () => {
        this.toast.success(`SLA for ${config.priority} saved.`);
        this.saving.set(false);
      },
      error: () => { this.saving.set(false); this.toast.error('Failed to save SLA config.'); }
    });
  }

  priorityClass(p: string): string {
    const map: Record<string, string> = { P1: 'badge-p1', P2: 'badge-p2', P3: 'badge-p3', P4: 'badge-p4' };
    return map[p] ?? '';
  }

  priorityDesc(p: string): string {
    const map: Record<string, string> = {
      P1: 'Critical', P2: 'High', P3: 'Medium', P4: 'Low'
    };
    return map[p] ?? '';
  }
}
