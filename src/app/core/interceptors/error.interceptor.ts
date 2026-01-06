import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/notifications.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 0:
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Requête invalide';
            break;
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            authService.logout();
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = 'Accès non autorisé';
            if (error.error?.message?.includes('premium')) {
              errorMessage = 'Cette fonctionnalité nécessite un abonnement Premium';
              router.navigate(['/subscription']);
            }
            break;
          case 404:
            errorMessage = error.error?.message || 'Ressource non trouvée';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflit de données';
            break;
          case 422:
            errorMessage = error.error?.message || 'Données invalides';
            break;
          case 429:
            errorMessage = 'Trop de requêtes. Veuillez patienter.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = 'Service temporairement indisponible';
            break;
          default:
            errorMessage = error.error?.message || `Erreur ${error.status}`;
        }
      }

      // Show toast for errors (except 401 which redirects)
      if (error.status !== 401) {
        toastService.error(errorMessage);
      }

      return throwError(() => ({ ...error, friendlyMessage: errorMessage }));
    })
  );
};
