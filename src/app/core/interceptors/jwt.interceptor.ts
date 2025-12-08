import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Récupérer l'utilisateur actuel et son token
    // (On suppose que votre AuthService expose le token via currentUser$ ou une méthode getToken())
    const token = localStorage.getItem('token'); // Simplification pour l'exemple
    const isApiUrl = request.url.startsWith(environment.apiUrl);

    // 2. Si l'utilisateur est connecté et que la requête part vers NOTRE API
    if (token && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}