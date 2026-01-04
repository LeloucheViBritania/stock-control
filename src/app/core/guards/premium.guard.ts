/**
 * Guard pour les fonctionnalités Premium
 * Redirige vers la page premium-requis si l'utilisateur n'est pas premium
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

export const premiumGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord l'authentification
  if (!authService.authenticated()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Vérifier le statut premium
  if (authService.isPremium()) {
    return true;
  }

  // Non premium, rediriger vers la page d'upgrade
  router.navigate(['/premium-requis'], {
    queryParams: { 
      returnUrl: state.url,
      feature: route.data?.['feature'] || 'premium',
    },
  });

  return false;
};
