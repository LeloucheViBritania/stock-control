/**
 * Guard de contrôle des rôles
 * Vérifie que l'utilisateur a le rôle requis
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { Role } from '@enums/role.enum';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord l'authentification
  if (!authService.authenticated()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Récupérer les rôles requis depuis les données de route
  const requiredRoles = route.data?.['roles'] as Role[] | undefined;

  // Si aucun rôle n'est requis, autoriser
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Vérifier si l'utilisateur a un des rôles requis
  if (authService.hasRole(requiredRoles)) {
    return true;
  }

  // Accès refusé
  router.navigate(['/acces-refuse']);
  return false;
};
