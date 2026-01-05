/**
 * Intercepteur de gestion des erreurs HTTP
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ne pas afficher d'erreur pour le dashboard (il utilise des données mock)
      const isDashboardRequest = req.url.includes('/dashboard/');
      
      // Ne pas afficher d'erreur pour les 401 (gestion silencieuse)
      if (error.status === 401 || isDashboardRequest) {
        return throwError(() => ({
          status: error.status,
          message: error.error?.message || 'Erreur',
          originalError: error,
        }));
      }

      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = error.error.message;
      } else {
        // Erreur côté serveur
        switch (error.status) {
          case 0:
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Requête invalide';
            break;
          case 403:
            errorMessage = 'Accès non autorisé';
            router.navigate(['/acces-refuse']);
            break;
          case 404:
            errorMessage = error.error?.message || 'Ressource non trouvée';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflit de données';
            break;
          case 422:
            // Erreurs de validation
            if (error.error?.errors) {
              const validationErrors = Object.values(error.error.errors).flat();
              errorMessage = validationErrors.join(', ');
            } else {
              errorMessage = error.error?.message || 'Données invalides';
            }
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

      // Afficher la notification
      notificationService.error(errorMessage);

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error,
      }));
    })
  );
};
