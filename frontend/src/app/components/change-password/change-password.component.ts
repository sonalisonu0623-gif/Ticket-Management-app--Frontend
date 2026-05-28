import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="form-page">

      <div class="page-header">
        <a routerLink="/profile" class="back-link">‹ Back to Profile</a>
        <div class="page-title">
          <span class="title-mark">🔑</span> CHANGE PASSWORD
        </div>
      </div>

      <div class="alert alert-success" *ngIf="successMessage"><span>✓</span> {{ successMessage }}</div>
      <div class="alert alert-error"   *ngIf="error"><span>✕</span> {{ error }}</div>

      <div class="form-card" [formGroup]="form">

        <div class="form-grid form-grid-1">
          <div class="form-group">
            <label class="form-label required"><span class="label-prefix">01</span> CURRENT PASSWORD</label>
            <div class="password-wrapper">
              <input [type]="show1 ? 'text' : 'password'" class="form-control"
                     formControlName="currentPassword" placeholder="Enter current password"
                     [class.invalid]="isInvalid('currentPassword')" />
              <button type="button" class="pw-toggle" (click)="show1 = !show1" tabindex="-1">{{ show1 ? '🙈' : '👁' }}</button>
            </div>
            <div class="field-error" *ngIf="isInvalid('currentPassword')">Current password is required</div>
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label required"><span class="label-prefix">02</span> NEW PASSWORD</label>
            <div class="password-wrapper">
              <input [type]="show2 ? 'text' : 'password'" class="form-control"
                     formControlName="newPassword" placeholder="Min 6 characters"
                     [class.invalid]="isInvalid('newPassword')" />
              <button type="button" class="pw-toggle" (click)="show2 = !show2" tabindex="-1">{{ show2 ? '🙈' : '👁' }}</button>
            </div>
            <div class="field-error" *ngIf="isInvalid('newPassword')">{{ getError('newPassword') }}</div>
          </div>
          <div class="form-group">
            <label class="form-label required"><span class="label-prefix">03</span> CONFIRM PASSWORD</label>
            <div class="password-wrapper">
              <input [type]="show3 ? 'text' : 'password'" class="form-control"
                     formControlName="confirmPassword" placeholder="Repeat new password"
                     [class.invalid]="isInvalid('confirmPassword') || mismatch" />
              <button type="button" class="pw-toggle" (click)="show3 = !show3" tabindex="-1">{{ show3 ? '🙈' : '👁' }}</button>
            </div>
            <div class="field-error" *ngIf="mismatch">Passwords do not match</div>
            <div class="field-error" *ngIf="!mismatch && isInvalid('confirmPassword')">Confirm password is required</div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-submit" (click)="onSubmit()" [disabled]="submitting">
            <span *ngIf="!submitting">→ UPDATE PASSWORD</span>
            <span *ngIf="submitting" class="submitting-text"><span class="mini-spinner"></span> UPDATING...</span>
          </button>
          <a routerLink="/profile" class="btn-cancel">✕ CANCEL</a>
        </div>

      </div>
    </div>
  `,
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  form: FormGroup;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  show1 = false; show2 = false; show3 = false;

  constructor(private fb: FormBuilder, private userService: UserManagementService) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  get mismatch(): boolean {
    const { newPassword, confirmPassword } = this.form.value;
    return !!(confirmPassword && newPassword && newPassword !== confirmPassword);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.mismatch) { this.error = 'Passwords do not match.'; return; }
    this.submitting = true; this.error = null;

    this.userService.changePassword(this.form.value).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Password updated successfully!';
        this.form.reset();
        setTimeout(() => this.successMessage = null, 4000);
      },
      error: err => {
        this.submitting = false;
        this.error = err?.error?.message || 'Failed to change password.';
      }
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c && c.invalid && (c.dirty || c.touched)); }
  getError(f: string): string {
    const c = this.form.get(f);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'This field is required';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters`;
    return '';
  }
}
