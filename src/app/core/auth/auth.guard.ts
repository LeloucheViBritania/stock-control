import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user) return true;
        this.router.navigate(['/auth/login']);
        return false;
      })
    );
  }
}