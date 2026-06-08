import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { UserDTO } from '../../models/models';
import { roleLabel, roleClass, formatDateTime } from '../../models/utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  readonly auth  = inject(AuthService);
  private api    = inject(ApiService);
  private toast  = inject(ToastService);

  loading = signal(true);
  user    = signal<UserDTO | null>(null);

  readonly roleLabel      = roleLabel;
  readonly roleClass      = roleClass;
  readonly formatDateTime = formatDateTime;

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: res => { this.user.set(res.data); this.loading.set(false); },
      error: () => {
        // Fallback to cached user data
        this.user.set(this.auth.currentUser() as any);
        this.loading.set(false);
      }
    });
  }

  get initials(): string { return (this.user()?.username ?? 'U')[0].toUpperCase(); }

  logout(): void { this.auth.logout(); }
}
