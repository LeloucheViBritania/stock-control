import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, Utilisateur } from '../../../shared/models/user.model';
import { LoginDto } from './dto/login.dto'; // À créer : email/password
import { TierAbonnement } from '../../../shared/models/enums.model';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Stocke l'état de l'utilisateur actuel
  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    // Au démarrage, on pourrait charger l'utilisateur depuis le localStorage
    this.loadUserFromStorage();
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // 1. Stocker le token (backend retourne access_token)
        localStorage.setItem('token', response.access_token);
        // 2. Stocker l'utilisateur (backend retourne utilisateur)
        localStorage.setItem('user', JSON.stringify(response.utilisateur));
        // 3. Mettre à jour l'état de l'application
        this.currentUserSubject.next(response.utilisateur);
        // 4. Afficher une notification de succès
        this.notificationService.success(
          `Bienvenue ${response.utilisateur.nomComplet || response.utilisateur.nomUtilisateur}!`,
          'Connexion réussie'
        );
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Échec de la connexion');
        return throwError(() => error);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.notificationService.info('À bientôt!', 'Déconnexion');
  }

  // Utilitaire pour vérifier rapidement si Premium
  isPremium(): boolean {
    const user = this.currentUserSubject.value;
    return user?.tierAbonnement === TierAbonnement.PREMIUM;
  }

  private loadUserFromStorage() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap(() => {
        this.notificationService.success(
          'Vous pouvez maintenant vous connecter',
          'Inscription réussie'
        );
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Échec de l\'inscription');
        return throwError(() => error);
      })
    );
  }
}