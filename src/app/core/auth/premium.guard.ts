import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../auth.service';
import { TierAbonnement } from '../../../shared/models/enums.model';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PremiumGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        // On vérifie si le tier est PREMIUM
        if (user && user.tierAbonnement === TierAbonnement.PREMIUM) {
          return true;
        }
        
        // Sinon, redirection vers une page "Upgrade" ou retour au dashboard
        // Idéalement, afficher une notification "Fonctionnalité réservée aux membres Premium"
        this.router.navigate(['/dashboard']); 
        return false;
      })
    );
  }
}