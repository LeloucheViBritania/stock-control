/**
 * Service d'authentification
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from '@env/environment';
import { Role } from '@enums/role.enum';
import { TierAbonnement } from '@enums/tier-abonnement.enum';

// Interfaces
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  tier: TierAbonnement;
  avatar?: string;
  telephone?: string;
  entreprise?: string;
  entrepriseId?: string;
  entrepriseNom?: string;
  poste?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  entrepriseNom?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const TOKEN_KEY = environment.auth.tokenKey;
const REFRESH_TOKEN_KEY = environment.auth.refreshTokenKey;
const USER_KEY = environment.auth.userKey;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);

  // Signals
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);
  private isLoading = signal<boolean>(false);

  // Computed
  readonly user = computed(() => this.currentUser());
  readonly authenticated = computed(() => this.isAuthenticated());
  readonly loading = computed(() => this.isLoading());
  readonly isPremium = computed(() => this.currentUser()?.tier === TierAbonnement.PREMIUM);
  readonly userRole = computed(() => this.currentUser()?.role);

  // Subject pour les événements d'auth
  private authState$ = new BehaviorSubject<boolean>(false);

  /**
   * Vérifie le statut d'authentification au démarrage
   */
  checkAuthStatus(): void {
    const token = this.getToken();
    const user = this.storageService.get<User>(USER_KEY);

    if (token && user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.authState$.next(true);
    } else {
      this.clearAuth();
    }
  }

  /**
   * Connexion
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        throw error;
      })
    );
  }

  /**
   * Inscription
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        throw error;
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    // Appeler l'API de logout si nécessaire
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Rafraîchir le token
   */
  refreshToken(): Observable<AuthResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuth();
      return of(null);
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(() => {
        this.clearAuth();
        return of(null);
      })
    );
  }

  /**
   * Mot de passe oublié
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, {
      token,
      password,
    });
  }

  /**
   * Mettre à jour le profil
   */
  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/auth/profile`, data).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.storageService.set(USER_KEY, user);
      })
    );
  }

  /**
   * Changer le mot de passe
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(roles: Role | Role[]): boolean {
    const userRole = this.currentUser()?.role;
    if (!userRole) return false;

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(userRole);
  }

  /**
   * Vérifie si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.hasRole(Role.ADMIN);
  }

  /**
   * Récupère le token
   */
  getToken(): string | null {
    return this.storageService.get<string>(TOKEN_KEY);
  }

  /**
   * Récupère le refresh token
   */
  getRefreshToken(): string | null {
    return this.storageService.get<string>(REFRESH_TOKEN_KEY);
  }

  /**
   * Gère le succès de l'authentification
   */
  private handleAuthSuccess(response: AuthResponse): void {
    this.storageService.set(TOKEN_KEY, response.accessToken);
    this.storageService.set(REFRESH_TOKEN_KEY, response.refreshToken);
    this.storageService.set(USER_KEY, response.user);

    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
    this.authState$.next(true);
  }

  /**
   * Nettoie les données d'authentification
   */
  private clearAuth(): void {
    this.storageService.remove(TOKEN_KEY);
    this.storageService.remove(REFRESH_TOKEN_KEY);
    this.storageService.remove(USER_KEY);

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.authState$.next(false);
  }
}
