import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }

    const requiredRoles: UserRole[] = route.data?.['roles'] ?? [];
    if (requiredRoles.length === 0) return true;

    if (this.authService.hasRole(...requiredRoles)) {
      return true;
    }

    // Redirect to the correct landing for the user's actual role
    return this.router.createUrlTree([this.getRoleLanding()]);
  }

  private getRoleLanding(): string {
    if (this.authService.isAdmin()) return '/dashboard';
    if (this.authService.isProjectManager()) return '/tickets';
    return '/my-tickets';
  }
}
