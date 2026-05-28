import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/auth.model';
import { ROLE_LABELS } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="form-page">
      <div class="page-header">
        <div class="page-title">
          <span class="title-mark">◉</span> MY PROFILE
        </div>
      </div>

      <div class="form-card" *ngIf="profile">

        <div class="form-grid form-grid-2">
          <div class="field-display">
            <div class="field-label"><span class="label-prefix">01</span> USERNAME</div>
            <div class="field-value">{{ profile.username }}</div>
          </div>
          <div class="field-display">
            <div class="field-label"><span class="label-prefix">02</span> EMAIL</div>
            <div class="field-value">{{ profile.email }}</div>
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div class="field-display">
            <div class="field-label"><span class="label-prefix">03</span> ROLE</div>
            <div class="field-value">
              <span class="role-badge" [ngClass]="getRoleClass(profile.role)">
                {{ roleLabels[profile.role] }}
              </span>
            </div>
          </div>
          <div class="field-display">
            <div class="field-label"><span class="label-prefix">04</span> ACCOUNT STATUS</div>
            <div class="field-value">
              <span class="status-badge" [ngClass]="profile.isActive ? 'status-active' : 'status-inactive'">
                {{ profile.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>

        <div class="form-grid form-grid-1">
          <div class="field-display">
            <div class="field-label"><span class="label-prefix">05</span> MEMBER SINCE</div>
            <div class="field-value">{{ profile.createdAt | date:'dd MMMM yyyy, HH:mm' }}</div>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/change-password" class="btn-submit">🔑 CHANGE PASSWORD</a>
        </div>

      </div>

      <div class="loading-state" *ngIf="!profile">
        <div class="spinner"></div><span>Loading profile...</span>
      </div>
    </div>
  `,
  styles: [`
    .field-display { display: flex; flex-direction: column; gap: 0.5rem; }
    .field-label {
      font-family: 'Courier New', monospace; font-size: 0.68rem;
      font-weight: 700; letter-spacing: 0.12em; color: var(--text-muted);
      display: flex; align-items: center; gap: 0.5rem;
    }
    .label-prefix { color: var(--accent); opacity: 0.5; font-size: 0.65rem; }
    .field-value {
      font-size: 0.9rem; color: var(--text-bright);
      padding: 0.6rem 0.9rem;
      background: var(--input-bg); border: 1px solid var(--border-mid); border-radius: 4px;
    }
    .role-badge { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 3px; letter-spacing: 0.03em; }
    .role-admin { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); color: #ff6b6b; }
    .role-pm    { background: rgba(255,169,77,0.1);  border: 1px solid rgba(255,169,77,0.3);  color: #ffa94d; }
    .role-emp   { background: rgba(105,219,124,0.1); border: 1px solid rgba(105,219,124,0.3); color: #69db7c; }
    .status-active   { background: rgba(105,219,124,0.1); border: 1px solid rgba(105,219,124,0.3); color: #69db7c; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 3px; }
    .status-inactive { background: rgba(134,142,150,0.1); border: 1px solid rgba(134,142,150,0.25); color: #868e96; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 3px; }
    .form-page { color: var(--text-primary); max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-title { display: flex; align-items: center; gap: 0.75rem; font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: 700; letter-spacing: 0.15em; color: var(--text-secondary); }
    .title-mark { color: var(--accent); }
    .form-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; padding: 2rem; display: flex; flex-direction: column; gap: 1.75rem; }
    .form-grid { display: grid; gap: 1.5rem; }
    .form-grid-1 { grid-template-columns: 1fr; }
    .form-grid-2 { grid-template-columns: 1fr 1fr; }
    .form-actions { display: flex; padding-top: 0.5rem; border-top: 1px solid var(--border); }
    .btn-submit { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 2rem; background: var(--accent-bg); border: 1px solid var(--accent-border); border-radius: 4px; color: var(--accent); font-family: 'Courier New', monospace; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-decoration: none; transition: all 0.2s; cursor: pointer; }
    .btn-submit:hover { background: var(--accent-hover); }
    .loading-state { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); padding: 4rem; }
    .spinner { width: 24px; height: 24px; border: 2px solid var(--accent-border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 600px) { .form-grid-2 { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  roleLabels = ROLE_LABELS;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: p => this.profile = p,
      error: () => {}
    });
  }

  getRoleClass(role: string): string {
    const m: Record<string, string> = { ADMIN: 'role-admin', PROJECT_MANAGER: 'role-pm', EMPLOYEE: 'role-emp' };
    return m[role] || '';
  }
}
