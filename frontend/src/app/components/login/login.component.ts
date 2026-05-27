import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { AuthResponse, UserRole } from '../../models/auth.model';

type LoginMode = 'ADMIN_LOGIN' | 'USER_LOGIN';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;
  isDark = this.themeService.isDark;

  // Login mode selector
  loginMode: LoginMode = 'ADMIN_LOGIN';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    if (this.authService.isAuthenticated()) {
      this.redirectByRole(this.authService.userRole()!);
    }

    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  setMode(mode: LoginMode): void {
    this.loginMode = mode;
    this.error = null;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { usernameOrEmail, password } = this.loginForm.value;

    this.authService.login({ usernameOrEmail, password }).subscribe({
      next: (data: AuthResponse) => {
        this.loading = false;

        // Role validation against selected mode
        const roleError = this.validateRoleForMode(data.role);
        if (roleError) {
          // Log out the just-saved session and show error
          this.authService.logout();
          // logout() navigates to /login but we're already here, stay put
          this.error = roleError;
          return;
        }

        this.redirectByRole(data.role);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Invalid credentials. Please try again.';
      }
    });
  }

  private validateRoleForMode(role: UserRole): string | null {
    const adminRoles: UserRole[] = ['ADMIN', 'PROJECT_MANAGER'];
    const userRoles: UserRole[] = ['EMPLOYEE'];

    if (this.loginMode === 'ADMIN_LOGIN' && userRoles.includes(role)) {
      return 'Access denied. Please use User Login.';
    }
    if (this.loginMode === 'USER_LOGIN' && adminRoles.includes(role)) {
      return 'Access denied. Please use Admin Login.';
    }
    return null;
  }

  private redirectByRole(role: UserRole): void {
    if (role === 'ADMIN') {
      this.router.navigate(['/dashboard']);
    } else if (role === 'PROJECT_MANAGER') {
      this.router.navigate(['/tickets']);
    } else {
      this.router.navigate(['/my-tickets']);
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
