import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/notifications.service';

export const premiumGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Admin always has access
  if (authService.isAdmin()) {
    return true;
  }

  // Check premium access
  if (authService.hasPremiumAccess()) {
    return true;
  }

  // User doesn't have premium
  toastService.warning(
    'Cette fonctionnalité nécessite un abonnement Premium. Contactez votre administrateur.',
    'Accès Premium requis'
  );
  
  // Redirect to subscription page or dashboard
  router.navigate(['/subscription']);
  return false;
};
