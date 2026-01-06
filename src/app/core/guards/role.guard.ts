import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/notifications.service';
import { Role } from '../models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const requiredRoles = route.data['roles'] as Role[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const user = authService.currentUser();
  
  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Admin has access to everything
  if (user.role === Role.ADMIN) {
    return true;
  }

  // Check if user has required role
  if (requiredRoles.includes(user.role)) {
    return true;
  }

  // User doesn't have required role
  toastService.error('Vous n\'avez pas les permissions nécessaires pour accéder à cette page.');
  router.navigate(['/dashboard']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isAdmin()) {
    return true;
  }

  toastService.error('Accès réservé aux administrateurs.');
  router.navigate(['/dashboard']);
  return false;
};

export const gestionnaireGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isGestionnaire()) {
    return true;
  }

  toastService.error('Accès réservé aux gestionnaires et administrateurs.');
  router.navigate(['/dashboard']);
  return false;
};
