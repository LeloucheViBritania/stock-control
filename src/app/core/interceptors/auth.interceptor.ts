/**
 * Intercepteur d'authentification
 * Ajoute le token JWT aux requêtes
 */
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { environment } from '@env/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Ne pas ajouter le token pour les routes d'auth publiques
  const isPublicAuthRoute = req.url.includes('/auth/login') || 
                            req.url.includes('/auth/register') || 
                            req.url.includes('/auth/forgot-password') ||
                            req.url.includes('/auth/reset-password');
  const isExternalUrl = !req.url.startsWith(environment.apiUrl);

  if (isPublicAuthRoute || isExternalUrl) {
    return next(req);
  }

  const token = authService.getToken();

  if (token) {
    req = addToken(req, token);
  }

  // Ne PAS intercepter les erreurs ici - laisser les services gérer leurs erreurs
  // Le logout automatique était problématique
  return next(req);
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
