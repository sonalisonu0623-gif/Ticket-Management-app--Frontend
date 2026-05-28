import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-root">
      <!-- Background grid -->
      <div class="bg-grid"></div>
      <div class="bg-glow"></div>

      <div class="auth-card">
        <!-- Logo -->
        <div class="auth-logo">
          <div class="logo-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="logo-name">TicketOps</span>
        </div>

        <div class="auth-header">
          <h1 class="auth-title">Welcome back</h1>
          <p class="auth-subtitle">Sign in to your enterprise account</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <!-- Username -->
          <div class="form-field">
            <label class="field-label required">Username</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                class="field-input with-icon"
                [class.invalid]="isInvalid('username')"
                formControlName="username"
                placeholder="Enter your username"
                autocomplete="username"
              />
            </div>
            @if (isInvalid('username')) {
              <span class="field-error">Username is required</span>
            }
          </div>

          <!-- Password -->
          <div class="form-field">
            <label class="field-label required">Password</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </span>
              <input
                class="field-input with-icon"
                [class.invalid]="isInvalid('password')"
                formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button type="button" class="password-toggle" (click)="showPassword.update(v => !v)">
                @if (showPassword()) {
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                } @else {
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              </button>
            </div>
            @if (isInvalid('password')) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <!-- Error message -->
          @if (errorMsg()) {
            <div class="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errorMsg() }}
            </div>
          }

          <button type="submit" class="btn-signin" [disabled]="loading()">
            @if (loading()) {
              <span class="btn-spinner"></span>
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="auth-footer">
          <p class="auth-footer-text">Enterprise Support Portal &bull; v2.0</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-root {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      position: relative;
      overflow: hidden;
    }

    /* Decorative background */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .bg-glow {
      position: absolute;
      top: -200px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 600px;
      background: radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Card */
    .auth-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 400px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 36px 32px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
    }

    .auth-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
    }
    .logo-mark {
      width: 42px; height: 42px;
      background: var(--accent);
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
    }
    .logo-name { font-size: 20px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }

    .auth-header { margin-bottom: 24px; }
    .auth-title { font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; }
    .auth-subtitle { font-size: 13.5px; color: var(--text-muted); margin-top: 4px; }

    .auth-form { display: flex; flex-direction: column; gap: 0; }

    /* Input with icon */
    .input-wrap { position: relative; }
    .input-icon {
      position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
      color: var(--text-muted); display: flex; pointer-events: none;
    }
    .field-input.with-icon { padding-left: 36px; }
    .password-toggle {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: var(--text-muted);
      cursor: pointer; padding: 4px; display: flex;
      transition: color 0.15s;
    }
    .password-toggle:hover { color: var(--text-primary); }

    /* Error */
    .auth-error {
      display: flex; align-items: center; gap: 8px;
      background: var(--danger-light); border: 1px solid rgba(239,68,68,0.2);
      color: var(--danger); border-radius: 7px; padding: 10px 12px;
      font-size: 13px; margin-bottom: 14px;
    }

    .btn-signin {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 11px;
      background: var(--accent); color: white;
      border: none; border-radius: 8px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      transition: all 0.15s; margin-top: 8px;
    }
    .btn-signin:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
    .btn-signin:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-spinner {
      width: 15px; height: 15px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-footer { margin-top: 24px; text-align: center; }
    .auth-footer-text { font-size: 12px; color: var(--text-muted); }

    @media (max-width: 480px) {
      .auth-card { padding: 28px 20px; margin: 16px; }
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  errorMsg = signal('');

  private returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Invalid credentials. Please try again.';
        this.errorMsg.set(msg);
      },
      complete: () => this.loading.set(false)
    });
  }
}
