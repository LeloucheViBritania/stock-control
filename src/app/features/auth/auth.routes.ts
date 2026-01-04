/**
 * Routes du module Auth
 */
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
        data: { title: 'Connexion' },
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
        data: { title: 'Inscription' },
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        data: { title: 'Mot de passe oublié' },
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        data: { title: 'Réinitialiser le mot de passe' },
      },
    ],
  },
];
