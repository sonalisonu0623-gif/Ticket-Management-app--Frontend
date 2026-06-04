import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;background:#0b0f1a;text-align:center;padding:20px">
      <span class="material-symbols-rounded" style="font-size:72px;color:#ef4444;opacity:.6">block</span>
      <h1 style="color:#e2e8f0;font-size:28px;font-weight:800;margin:0">403 — Access Denied</h1>
      <p style="color:#8fa3bf;font-size:14px;max-width:380px;margin:0">You don't have permission to access this page. Contact your administrator if you believe this is an error.</p>
      <a routerLink="/dashboard" class="btn btn-primary" style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#3b82f6;color:white;border-radius:8px;font-weight:600;text-decoration:none">
        <span class="material-symbols-rounded" style="font-size:18px">home</span>
        Back to Dashboard
      </a>
    </div>
  `
})
export class ForbiddenComponent {}
