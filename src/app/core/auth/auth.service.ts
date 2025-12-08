import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, Utilisateur } from '../../../shared/models/user.model';
import { LoginDto } from './dto/login.dto'; // À créer : email/password
import { TierAbonnement } from '../../../shared/models/enums.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Stocke l'état de l'utilisateur actuel
  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Au démarrage, on pourrait charger l'utilisateur depuis le localStorage
    this.loadUserFromStorage();
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // 1. Stocker le token
        localStorage.setItem('token', response.accessToken);
        // 2. Stocker l'utilisateur (optionnel, ou juste décoder le token)
        localStorage.setItem('user', JSON.stringify(response.user));
        // 3. Mettre à jour l'état de l'application
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
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
  return this.http.post(`${this.apiUrl}/register`, user);
}
}