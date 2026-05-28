import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const requiredRoles = route.data['roles'] as string[] | undefined;
  if (requiredRoles?.length) {
    const userRole = auth.userRole();
    if (!userRole || !requiredRoles.includes(userRole)) {
      router.navigate(['/forbidden']);
      return false;
    }
  }

  return true;
};
