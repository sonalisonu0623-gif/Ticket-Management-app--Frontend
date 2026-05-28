import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);
  const token = authService.token();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          toast.error('Session expired. Please log in again.');
          authService.logout();
          break;
        case 403:
          toast.error('Access denied. You do not have permission.');
          router.navigate(['/forbidden']);
          break;
        case 0:
          toast.error('Network error. Please check your connection.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          // Let individual services handle other errors
          break;
      }
      return throwError(() => error);
    })
  );
};
