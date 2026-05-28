import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">My Profile</h1>
          <p class="page-subtitle">Manage your account information</p>
        </div>
      </div>

      <div class="profile-layout">
        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-avatar-lg">{{ auth.userInitials() }}</div>
          <div class="profile-meta">
            <div class="profile-username">{{ auth.currentUser()?.username }}</div>
            <div class="profile-email">{{ auth.currentUser()?.email }}</div>
            <span class="role-chip-lg">{{ formatRole(auth.userRole()) }}</span>
          </div>

          <div class="profile-stats">
            <div class="profile-stat">
              <div class="stat-num">{{ auth.assignedProjects().length }}</div>
              <div class="stat-lbl">Projects</div>
            </div>
          </div>

          <!-- Assigned Projects -->
          @if (auth.assignedProjects().length > 0) {
            <div class="assigned-projects">
              <div class="ap-title">Assigned Projects</div>
              @for (p of auth.assignedProjects(); track p.id) {
                <div class="ap-item" [class.active-proj]="p.id === auth.activeProject()?.id">
                  <div class="ap-dot" [style.background]="getProjectColor(p.id)"></div>
                  <div class="ap-info">
                    <span class="ap-name">{{ p.projectName }}</span>
                    <span class="ap-code">{{ p.projectCode }}</span>
                  </div>
                  @if (p.id === auth.activeProject()?.id) {
                    <span class="active-badge">Active</span>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Right: Details + Password -->
        <div class="profile-right">
          <!-- Account Info -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span class="section-title">Account Information</span>
            </div>

            <div class="info-rows">
              <div class="info-row">
                <span class="info-key">Username</span>
                <span class="info-val">{{ auth.currentUser()?.username }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Email</span>
                <span class="info-val">{{ auth.currentUser()?.email ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Role</span>
                <span class="info-val">{{ formatRole(auth.userRole()) }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">User ID</span>
                <span class="info-val mono">#{{ auth.currentUser()?.id }}</span>
              </div>
            </div>
          </div>

          <!-- Change Password -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <span class="section-title">Change Password</span>
            </div>

            <form [formGroup]="pwForm" (ngSubmit)="changePassword()">
              <div class="form-field">
                <label class="field-label required">Current Password</label>
                <input
                  class="field-input"
                  [class.invalid]="isPwInvalid('currentPassword')"
                  formControlName="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                />
                @if (isPwInvalid('currentPassword')) {
                  <span class="field-error">Current password is required</span>
                }
              </div>

              <div class="form-field">
                <label class="field-label required">New Password</label>
                <input
                  class="field-input"
                  [class.invalid]="isPwInvalid('newPassword')"
                  formControlName="newPassword"
                  type="password"
                  placeholder="Min 8 characters"
                />
                @if (isPwInvalid('newPassword')) {
                  <span class="field-error">Min 8 characters required</span>
                }
              </div>

              <div class="form-field">
                <label class="field-label required">Confirm New Password</label>
                <input
                  class="field-input"
                  [class.invalid]="isPwInvalid('confirmPassword') || passwordMismatch()"
                  formControlName="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                />
                @if (passwordMismatch()) {
                  <span class="field-error">Passwords do not match</span>
                }
              </div>

              <button type="submit" class="btn btn-primary" [disabled]="savingPw()">
                @if (savingPw()) { <span class="btn-spinner"></span> }
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 20px; align-items: start; }

    /* Profile card */
    .profile-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 12px; padding: 24px; text-align: center;
    }
    .profile-avatar-lg {
      width: 72px; height: 72px; border-radius: 18px;
      background: var(--accent); color: white;
      font-size: 24px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .profile-username { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .profile-email { font-size: 13px; color: var(--text-muted); margin-top: 3px; }
    .role-chip-lg {
      display: inline-block; margin-top: 8px;
      padding: 4px 12px; border-radius: 5px;
      background: var(--accent-light); color: var(--accent);
      font-size: 12px; font-weight: 600;
    }
    .profile-stats { display: flex; justify-content: center; gap: 24px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }
    .stat-num { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .stat-lbl { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

    /* Assigned projects */
    .assigned-projects { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); text-align: left; }
    .ap-title { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
    .ap-item { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 7px; transition: background 0.12s; }
    .ap-item:hover { background: var(--nav-hover); }
    .ap-item.active-proj { background: var(--nav-active-bg); }
    .ap-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .ap-info { flex: 1; }
    .ap-name { font-size: 13px; font-weight: 500; color: var(--text-primary); display: block; }
    .ap-code { font-size: 11px; color: var(--text-muted); }
    .active-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; background: var(--success-light); color: var(--success); }

    /* Right column */
    .profile-right { display: flex; flex-direction: column; gap: 16px; }

    @media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent {
  pwForm: FormGroup;
  savingPw = signal(false);

  constructor(
    public auth: AuthService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.pwForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  passwordMismatch(): boolean {
    const ctrl = this.pwForm.get('confirmPassword');
    if (!ctrl?.touched) return false;
    return this.pwForm.get('newPassword')?.value !== ctrl.value;
  }

  isPwInvalid(field: string): boolean {
    const ctrl = this.pwForm.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  changePassword(): void {
    if (this.pwForm.invalid || this.passwordMismatch()) {
      this.pwForm.markAllAsTouched();
      return;
    }
    this.savingPw.set(true);
    // Call auth service change password endpoint
    // Placeholder: simulate success
    setTimeout(() => {
      this.toast.success('Password updated successfully.');
      this.pwForm.reset();
      this.savingPw.set(false);
    }, 800);
  }

  formatRole(role: string | undefined): string {
    if (!role) return '';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  getProjectColor(id?: number): string {
    const colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];
    return colors[(id ?? 0) % colors.length];
  }
}
