/**
 * Intercepteur de chargement
 * Affiche/masque le loader global pendant les requêtes
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '@services/loading.service';

// URLs à exclure du loading automatique
const EXCLUDED_URLS = [
  '/notifications',
  '/dashboard/stats',
];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Vérifier si l'URL doit être exclue
  const shouldSkip = EXCLUDED_URLS.some(url => req.url.includes(url));

  // Vérifier si le header X-Skip-Loading est présent
  const skipLoading = req.headers.has('X-Skip-Loading');

  if (shouldSkip || skipLoading) {
    // Retirer le header personnalisé
    const cleanReq = req.clone({
      headers: req.headers.delete('X-Skip-Loading'),
    });
    return next(cleanReq);
  }

  // Démarrer le loading
  loadingService.start();

  return next(req).pipe(
    finalize(() => {
      loadingService.stop();
    })
  );
};
