import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ROLES } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-card">
      <div class="login-head">
        <div class="login-logo"><span class="material-symbols-rounded">person_add</span></div>
        <h1 class="login-title">Create Account</h1>
        <p class="login-sub">Join TicketOps Enterprise</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate style="display:flex;flex-direction:column;gap:14px">

        @if (errorMsg()) {
          <div class="error-alert">
            <span class="material-symbols-rounded">error</span>
            <span>{{ errorMsg() }}</span>
          </div>
        }

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="field-group">
            <label class="lbl">Username</label>
            <input formControlName="username" type="text" class="inp-bare" placeholder="johndoe" />
            @if (f['username'].invalid && f['username'].touched) {
              <p class="err-msg">Min 3 characters</p>
            }
          </div>
          <div class="field-group">
            <label class="lbl">Email</label>
            <input formControlName="email" type="email" class="inp-bare" placeholder="john@co.com" />
            @if (f['email'].invalid && f['email'].touched) {
              <p class="err-msg">Valid email required</p>
            }
          </div>
        </div>

        <div class="field-group">
          <label class="lbl">Password</label>
          <input formControlName="password" type="password" class="inp-bare" placeholder="Min 6 characters" />
        </div>

        <div class="field-group">
          <label class="lbl">Role</label>
          <select formControlName="role" class="inp-bare" style="cursor:pointer">
            @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </div>

        <button type="submit" class="btn-login" [disabled]="loading()">
          @if (loading()) { <span class="spin"></span> Registering... }
          @else { <span class="material-symbols-rounded">person_add</span> Create Account }
        </button>

        <p class="footer-txt">Have an account? <a routerLink="/auth/login" class="link">Sign in</a></p>
      </form>
    </div>
  `,
  styleUrls: ['../login/login.component.css']
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  loading  = signal(false);
  errorMsg = signal('');
  roles    = ROLES;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role:     ['USER']
  });

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Account created! Please sign in.');
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Registration failed.');
      }
    });
  }
}
