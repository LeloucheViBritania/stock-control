import { Directive, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Subscription } from 'rxjs';
import { TierAbonnement } from '../models/enums.model';

@Directive({
  selector: '[appIfPremium]' // C'est ce nom qu'on utilisera dans le HTML
})
export class IfPremiumDirective implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscription = this.authService.currentUser$.subscribe(user => {
      if (user && user.tierAbonnement === TierAbonnement.PREMIUM) {
        // Si Premium, on affiche l'élément
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        // Sinon, on le supprime du DOM
        this.viewContainer.clear();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}