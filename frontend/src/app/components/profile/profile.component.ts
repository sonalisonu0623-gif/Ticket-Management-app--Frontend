import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { UserDTO } from '../../models/models';
import { roleLabel, roleClass, formatDateTime } from '../../models/utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  readonly auth = inject(AuthService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  user = signal<UserDTO | null>(null);

  // ✅ ADD THIS FORM (fixes NG9 error)
  form = this.fb.group({
    username: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }],
    role: [{ value: '', disabled: true }]
  });

  readonly roleLabel = roleLabel;
  readonly roleClass = roleClass;
  readonly formatDateTime = formatDateTime;

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: res => {
        const u = res.data;
        this.user.set(u);

        // patch form values
        this.form.patchValue({
          username: u.username,
          email: u.email,
          role: u.role
        });

        this.loading.set(false);
      },
      error: () => {
        const cached = this.auth.currentUser() as any;
        this.user.set(cached);

        this.form.patchValue({
          username: cached?.username,
          email: cached?.email,
          role: cached?.role
        });

        this.loading.set(false);
      }
    });
  }

  get initials(): string {
    return (this.user()?.username ?? 'U')[0].toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}