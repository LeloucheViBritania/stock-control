/**
 * Guard pour les pages publiques
 * Redirige vers le dashboard si déjà connecté
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.authenticated()) {
    return true;
  }

  // Déjà connecté, rediriger vers le dashboard
  router.navigate(['/dashboard']);
  return false;
};
