import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserDTO } from '../../core/models';
import { roleLabel, roleClass, formatDateTime } from '../../core/utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  readonly auth  = inject(AuthService);
  private toast  = inject(ToastService);
  private fb     = inject(FormBuilder);

  loading  = signal(true);
  saving   = signal(false);
  user     = signal<UserDTO | null>(null);

  readonly roleLabel     = roleLabel;
  readonly roleClass     = roleClass;
  readonly formatDateTime = formatDateTime;

  form = this.fb.group({
    username: [{ value: '', disabled: true }],
    email:    [{ value: '', disabled: true }],
    role:     [{ value: '', disabled: true }]
  });

  pwForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: res => {
        this.user.set(res.data);
        this.form.patchValue({
          username: res.data.username,
          email:    res.data.email,
          role:     res.data.role
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  logout(): void { this.auth.logout(); }

  get initials(): string {
    return (this.user()?.username ?? 'U')[0].toUpperCase();
  }
}
