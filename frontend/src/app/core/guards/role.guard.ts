import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;
  router.navigate(['/forbidden']);
  return false;
};

export const projectAccessGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const projectId = Number(route.paramMap.get('projectId'));
  if (!projectId) return true;

  if (auth.canAccessProject(projectId)) return true;

  router.navigate(['/forbidden']);
  return false;
};
