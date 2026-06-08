import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/models';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const roles = route.data['roles'] as UserRole[] | undefined;
  if (roles && roles.length > 0 && !auth.hasRole(...roles)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
