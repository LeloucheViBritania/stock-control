/**
 * Composant racine de l'application
 * Gestion de Stock Frontend
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

// Components
import { ToastComponent } from '@components/ui/toast/toast.component';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

// Services
import { LoadingService } from '@services/loading.service';
import { ThemeService } from '@services/theme.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // Services injectés
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  
  // Services publics pour le template
  readonly loadingService = inject(LoadingService);

  // Titre de base
  private readonly baseTitle = 'Gestion de Stock';

  ngOnInit(): void {
    // Initialiser le thème
    this.themeService.initTheme();

    // Vérifier l'authentification au démarrage
    this.authService.checkAuthStatus();

    // Gérer les titres de page dynamiques
    this.setupDynamicPageTitle();
  }

  /**
   * Configure la mise à jour automatique du titre de page
   * basée sur les données de route
   */
  private setupDynamicPageTitle(): void {
    this.router.events
      .pipe(
        // Filtrer uniquement les événements NavigationEnd
        filter(event => event instanceof NavigationEnd),
        // Obtenir la route activée
        map(() => this.activatedRoute),
        // Naviguer jusqu'à la route enfant la plus profonde
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        // Filtrer les routes avec outlet 'primary'
        filter(route => route.outlet === 'primary'),
        // Récupérer les données de la route
        mergeMap(route => route.data)
      )
      .subscribe(data => {
        // Mettre à jour le titre
        const pageTitle = data['title'];
        if (pageTitle) {
          this.titleService.setTitle(`${pageTitle} | ${this.baseTitle}`);
        } else {
          this.titleService.setTitle(this.baseTitle);
        }
      });
  }
}
