import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        // Si le backend renvoie 401 (Non autorisé) ou 403 (Interdit)
        if ([401, 403].includes(err.status)) {
          // Déconnexion automatique
          this.authService.logout();
          // Redirection vers le login (optionnel si géré par authService)
          this.router.navigate(['/auth/login']);
        }

        const error = err.error?.message || err.statusText;
        return throwError(() => error);
      })
    );
  }
}