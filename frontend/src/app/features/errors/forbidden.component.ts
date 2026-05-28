import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-root">
      <div class="error-card">
        <div class="error-code">403</div>
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 class="error-title">Access Denied</h1>
        <p class="error-body">You do not have permission to access this page. Contact your administrator if you believe this is an error.</p>
        <div class="error-actions">
          <button class="btn btn-secondary" (click)="goBack()">Go Back</button>
          <a routerLink="/dashboard" class="btn btn-primary">Dashboard</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); }
    .error-card { text-align: center; max-width: 420px; padding: 40px 32px; }
    .error-code { font-size: 80px; font-weight: 900; color: var(--danger); opacity: 0.2; line-height: 1; letter-spacing: -4px; }
    .error-icon { color: var(--danger); opacity: 0.5; margin: -20px auto 20px; }
    .error-title { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
    .error-body { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 28px; }
    .error-actions { display: flex; gap: 10px; justify-content: center; }
  `]
})
export class ForbiddenComponent {
  constructor(private location: Location) {}
  goBack(): void { this.location.back(); }
}
