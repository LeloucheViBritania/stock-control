/**
 * Configuration principale de l'application Angular
 * Gestion de Stock Frontend
 */

import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

// Toastr
import { provideToastr } from 'ngx-toastr';

// Routes
import { routes } from './app.routes';

// Interceptors
import { authInterceptor } from '@interceptors/auth.interceptor';
import { errorInterceptor } from '@interceptors/error.interceptor';
import { loadingInterceptor } from '@interceptors/loading.interceptor';

/**
 * Configuration de l'application
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // ============================================
    // ROUTER
    // ============================================
    provideRouter(
      routes,
      // Permet de binder les paramètres de route aux inputs des composants
      withComponentInputBinding(),
      // Active les transitions de vue (View Transitions API)
      withViewTransitions(),
      // Configuration du routeur
      withRouterConfig({
        // Comportement du scroll
        onSameUrlNavigation: 'reload',
        paramsInheritanceStrategy: 'always',
      })
    ),

    // ============================================
    // HTTP CLIENT
    // ============================================
    provideHttpClient(
      // Utilise l'API Fetch native
      withFetch(),
      // Interceptors fonctionnels
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor,
      ])
    ),

    // ============================================
    // ANIMATIONS
    // ============================================
    provideAnimations(),

    // ============================================
    // TOASTR (Notifications)
    // ============================================
    provideToastr({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      newestOnTop: true,
      maxOpened: 5,
      autoDismiss: true,
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning',
      },
    }),
  ],
};
