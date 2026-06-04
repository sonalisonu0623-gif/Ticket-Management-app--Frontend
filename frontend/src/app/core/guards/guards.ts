import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) { router.navigate(['/auth/login']); return false; }
  const roles: UserRole[] = route.data['roles'] ?? [];
  if (roles.length && !auth.hasRole(...roles)) { router.navigate(['/forbidden']); return false; }
  return true;
};

export const unauthGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) { router.navigate(['/dashboard']); return false; }
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) { router.navigate(['/auth/login']); return false; }
  if (!auth.isAdmin()) { router.navigate(['/forbidden']); return false; }
  return true;
};
