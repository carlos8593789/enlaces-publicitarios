import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data?.['role'] as string | undefined;
  const role = authService.getRole();

  if (!requiredRole || role === requiredRole) {
    return true;
  }

  if (role === 'cliente') {
    return router.createUrlTree(['/cliente']);
  }

  return router.createUrlTree(['/admin']);
};
