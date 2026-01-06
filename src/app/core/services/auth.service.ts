import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '@env/environment';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  Utilisateur, 
  Role, 
  TierAbonnement 
} from '../models';

const TOKEN_KEY = 'stock_control_token';
const USER_KEY = 'stock_control_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  // Signals for reactive state
  private currentUserSignal = signal<Utilisateur | null>(this.getStoredUser());
  private isAuthenticatedSignal = signal<boolean>(this.hasValidToken());
  
  // Public computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  
  readonly isAdmin = computed(() => this.currentUser()?.role === Role.ADMIN);
  readonly isGestionnaire = computed(() => 
    this.currentUser()?.role === Role.GESTIONNAIRE || this.currentUser()?.role === Role.ADMIN
  );
  readonly isPremium = computed(() => 
    this.currentUser()?.tierAbonnement === TierAbonnement.PREMIUM
  );
  readonly userRole = computed(() => this.currentUser()?.role);
  readonly userTier = computed(() => this.currentUser()?.tierAbonnement);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check token validity on service init
    this.checkTokenValidity();
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get current user profile from API
   */
  getProfile(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
        this.currentUserSignal.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  /**
   * Change password for authenticated user
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { 
      currentPassword, 
      newPassword 
    });
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Check if user has specific role
   */
  hasRole(roles: Role | Role[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  }

  /**
   * Check if user has premium access
   */
  hasPremiumAccess(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    
    // Check if premium and not expired
    if (user.tierAbonnement !== TierAbonnement.PREMIUM) return false;
    
    if (user.dateExpiration) {
      const expirationDate = new Date(user.dateExpiration);
      if (expirationDate < new Date()) return false;
    }
    
    return true;
  }

  /**
   * Refresh user data from storage
   */
  refreshUserFromStorage(): void {
    const user = this.getStoredUser();
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(!!user && this.hasValidToken());
  }

  // Private methods
  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.utilisateur));
    this.currentUserSignal.set(response.utilisateur);
    this.isAuthenticatedSignal.set(true);
  }

  private getStoredUser(): Utilisateur | null {
    try {
      const userJson = localStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Decode JWT and check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  private checkTokenValidity(): void {
    if (!this.hasValidToken()) {
      this.logout();
    }
  }
}
