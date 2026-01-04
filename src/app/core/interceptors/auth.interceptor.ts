/**
 * Intercepteur d'authentification
 * Ajoute le token JWT aux requêtes
 */
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { environment } from '@env/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Ne pas ajouter le token pour les routes d'auth (sauf logout)
  const isAuthRoute = req.url.includes('/auth/') && !req.url.includes('/logout');
  const isExternalUrl = !req.url.startsWith(environment.apiUrl);

  if (isAuthRoute || isExternalUrl) {
    return next(req);
  }

  const token = authService.getToken();

  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si erreur 401, essayer de rafraîchir le token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            if (response) {
              // Réessayer la requête avec le nouveau token
              return next(addToken(req, response.accessToken));
            }
            // Échec du refresh, déconnecter
            authService.logout();
            return throwError(() => error);
          }),
          catchError(err => {
            authService.logout();
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

/**
 * Ajoute le token à la requête
 */
function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
