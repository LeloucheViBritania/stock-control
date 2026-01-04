/**
 * Intercepteur de cache HTTP
 */
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

// Cache simple en mémoire
const cache = new Map<string, { response: HttpResponse<unknown>; timestamp: number }>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

// URLs à mettre en cache
const CACHEABLE_URLS = [
  '/categories',
  '/entrepots',
];

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne mettre en cache que les GET
  if (req.method !== 'GET') {
    // Invalider le cache pour les mutations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      invalidateRelatedCache(req.url);
    }
    return next(req);
  }

  // Vérifier si l'URL est cacheable
  const isCacheable = CACHEABLE_URLS.some(url => req.url.includes(url));
  
  // Vérifier si le header X-No-Cache est présent
  const noCache = req.headers.has('X-No-Cache');

  if (!isCacheable || noCache) {
    const cleanReq = req.clone({
      headers: req.headers.delete('X-No-Cache'),
    });
    return next(cleanReq);
  }

  // Clé de cache
  const cacheKey = req.urlWithParams;

  // Vérifier le cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DEFAULT_TTL) {
    return of(cached.response.clone());
  }

  // Faire la requête et mettre en cache
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(cacheKey, {
          response: event.clone(),
          timestamp: Date.now(),
        });
      }
    })
  );
};

/**
 * Invalide le cache pour une ressource modifiée
 */
function invalidateRelatedCache(url: string): void {
  const baseUrl = url.split('?')[0];
  
  cache.forEach((_, key) => {
    if (key.startsWith(baseUrl) || baseUrl.includes(key.split('?')[0])) {
      cache.delete(key);
    }
  });
}

/**
 * Vide tout le cache (à appeler si nécessaire)
 */
export function clearHttpCache(): void {
  cache.clear();
}
