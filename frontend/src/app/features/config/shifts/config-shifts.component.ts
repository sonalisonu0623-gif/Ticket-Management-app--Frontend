import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ShiftService } from '../../../core/services/sla.service';
import { ToastService } from '../../../core/services/toast.service';
import { Shift } from '../../../core/models/models';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMEZONES = [
  'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'
];

@Component({
  selector: 'app-config-shifts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">Shift Management</h1>
          <p class="page-subtitle">Configure working shifts and hours for SLA calculations</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Shift
        </button>
      </div>

      <!-- Shifts Grid -->
      @if (loading()) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else if (shifts().length === 0) {
        <div class="empty-state">
          <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p class="empty-title">No shifts defined</p>
          <p class="empty-sub">Create a shift to configure business hours for SLA calculations</p>
        </div>
      } @else {
        <div class="shifts-grid">
          @for (s of shifts(); track s.id) {
            <div class="shift-card">
              <div class="shift-card-header">
                <div class="shift-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="shift-title-wrap">
                  <div class="shift-name">{{ s.shiftName }}</div>
                  <div class="shift-tz">{{ s.timezone }}</div>
                </div>
                <div class="shift-actions-mini">
                  <button class="action-btn edit" (click)="openModal(s)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-btn delete" (click)="deleteShift(s)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  </button>
                </div>
              </div>

              <!-- Time display -->
              <div class="shift-time-block">
                <div class="time-pill">{{ s.startTime }}</div>
                <div class="time-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="time-pill">{{ s.endTime }}</div>
              </div>

              <!-- Working days calendar -->
              <div class="shift-days">
                @for (day of allDays; track day.short; let i = $index) {
                  <div class="day-dot" [class.active]="isWorkingDay(s, i)" [title]="day.full">
                    {{ day.short }}
                  </div>
                }
              </div>

              <div class="shift-hours-info">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ getDailyHours(s) }}h/day &bull; {{ s.workingDays?.length ?? 0 }} days/week
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal -->
      @if (modalOpen()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ editingShift() ? 'Edit Shift' : 'Create Shift' }}</h3>
              <button class="modal-close" (click)="closeModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <form [formGroup]="form">
                <div class="form-field">
                  <label class="field-label required">Shift Name</label>
                  <input class="field-input" [class.invalid]="isInvalid('shiftName')" formControlName="shiftName" placeholder="e.g. Day Shift, Night Shift" />
                  @if (isInvalid('shiftName')) { <span class="field-error">Required</span> }
                </div>

                <div class="form-grid two-col">
                  <div class="form-field">
                    <label class="field-label required">Start Time</label>
                    <input type="time" class="field-input" [class.invalid]="isInvalid('startTime')" formControlName="startTime" />
                    @if (isInvalid('startTime')) { <span class="field-error">Required</span> }
                  </div>
                  <div class="form-field">
                    <label class="field-label required">End Time</label>
                    <input type="time" class="field-input" [class.invalid]="isInvalid('endTime')" formControlName="endTime" />
                    @if (isInvalid('endTime')) { <span class="field-error">Required</span> }
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">Timezone</label>
                  <select class="field-select" formControlName="timezone">
                    @for (tz of timezones; track tz) {
                      <option [value]="tz">{{ tz }}</option>
                    }
                  </select>
                </div>

                <div class="form-field">
                  <label class="field-label required">Working Days</label>
                  <div class="days-picker">
                    @for (day of allDays; let i = $index; track day.short) {
                      <button
                        type="button"
                        class="day-picker-btn"
                        [class.active]="selectedDays.has(i)"
                        (click)="toggleDay(i)"
                      >
                        {{ day.short }}
                      </button>
                    }
                  </div>
                  @if (selectedDays.size === 0) {
                    <span class="field-error">Select at least one working day</span>
                  }
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button class="btn btn-primary" (click)="save()" [disabled]="saving() || selectedDays.size === 0">
                @if (saving()) { <span class="btn-spinner"></span> } {{ editingShift() ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .shifts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

    .shift-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 12px; padding: 18px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .shift-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-md); }

    .shift-card-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; }
    .shift-icon { width: 36px; height: 36px; border-radius: 9px; background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .shift-title-wrap { flex: 1; }
    .shift-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .shift-tz { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }
    .shift-actions-mini { display: flex; gap: 4px; }

    .shift-time-block { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .time-pill { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 6px; padding: 6px 12px; font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .time-arrow { color: var(--text-muted); }

    .shift-days { display: flex; gap: 6px; margin-bottom: 12px; }
    .day-dot { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; background: var(--bg-primary); color: var(--text-muted); transition: all 0.15s; }
    .day-dot.active { background: var(--accent); color: white; }

    .shift-hours-info { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted); }

    /* Days picker in modal */
    .days-picker { display: flex; gap: 8px; flex-wrap: wrap; }
    .day-picker-btn { width: 40px; height: 40px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit; }
    .day-picker-btn:hover { border-color: var(--accent); color: var(--accent); }
    .day-picker-btn.active { background: var(--accent); border-color: var(--accent); color: white; }
  `]
})
export class ConfigShiftsComponent implements OnInit {
  shifts = signal<Shift[]>([]);
  loading = signal(true);
  saving = signal(false);
  modalOpen = signal(false);
  editingShift = signal<Shift | null>(null);
  selectedDays = new Set<number>();
  form!: FormGroup;

  readonly allDays = [
    { short: 'Su', full: 'Sunday' },
    { short: 'Mo', full: 'Monday' },
    { short: 'Tu', full: 'Tuesday' },
    { short: 'We', full: 'Wednesday' },
    { short: 'Th', full: 'Thursday' },
    { short: 'Fr', full: 'Friday' },
    { short: 'Sa', full: 'Saturday' }
  ];
  readonly timezones = TIMEZONES;

  constructor(
    private fb: FormBuilder,
    private shiftService: ShiftService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadShifts();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      shiftName: ['', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['18:00', Validators.required],
      timezone: ['Asia/Kolkata']
    });
  }

  private loadShifts(): void {
    this.loading.set(true);
    this.shiftService.getAll().subscribe({
      next: s => { this.shifts.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openModal(shift?: Shift): void {
    this.editingShift.set(shift ?? null);
    if (shift) {
      this.form.patchValue({
        shiftName: shift.shiftName,
        startTime: shift.startTime,
        endTime: shift.endTime,
        timezone: shift.timezone
      });
      this.selectedDays = new Set(shift.workingDays?.map(d => +d) ?? []);
    } else {
      this.form.reset({ startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata' });
      this.selectedDays = new Set([1, 2, 3, 4, 5]); // Mon-Fri default
    }
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingShift.set(null);
    this.selectedDays = new Set();
  }

  toggleDay(i: number): void {
    if (this.selectedDays.has(i)) this.selectedDays.delete(i);
    else this.selectedDays.add(i);
  }

  save(): void {
    if (this.form.invalid || this.selectedDays.size === 0) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload: Shift = {
      ...this.form.value,
      workingDays: Array.from(this.selectedDays).sort().map(String)
    };
    const obs$ = this.editingShift()
      ? this.shiftService.update(this.editingShift()!.id!, payload)
      : this.shiftService.create(payload);

    obs$.subscribe({
      next: () => {
        this.toast.success(this.editingShift() ? 'Shift updated!' : 'Shift created!');
        this.saving.set(false);
        this.closeModal();
        this.loadShifts();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to save shift.');
      }
    });
  }

  deleteShift(s: Shift): void {
    if (!confirm(`Delete shift "${s.shiftName}"?`)) return;
    this.shiftService.delete(s.id!).subscribe({
      next: () => { this.toast.success('Shift deleted.'); this.loadShifts(); },
      error: () => this.toast.error('Failed to delete shift.')
    });
  }

  isWorkingDay(shift: Shift, dayIndex: number): boolean {
    return shift.workingDays?.includes(String(dayIndex)) ?? false;
  }

  getDailyHours(shift: Shift): number {
    if (!shift.startTime || !shift.endTime) return 0;
    const [sh, sm] = shift.startTime.split(':').map(Number);
    const [eh, em] = shift.endTime.split(':').map(Number);
    return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
