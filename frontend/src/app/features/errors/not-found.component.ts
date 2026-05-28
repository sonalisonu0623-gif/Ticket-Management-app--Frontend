import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-root">
      <div class="error-card">
        <div class="error-code">404</div>
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-body">The page you're looking for doesn't exist or has been moved.</p>
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
    .error-code { font-size: 80px; font-weight: 900; color: var(--accent); opacity: 0.2; line-height: 1; letter-spacing: -4px; }
    .error-icon { color: var(--accent); opacity: 0.4; margin: -20px auto 20px; }
    .error-title { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
    .error-body { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 28px; }
    .error-actions { display: flex; gap: 10px; justify-content: center; }
  `]
})
export class NotFoundComponent {
  constructor(private location: Location) {}
  goBack(): void { this.location.back(); }
}
