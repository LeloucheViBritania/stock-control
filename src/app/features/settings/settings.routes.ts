/**
 * Routes du module Paramètres
 */
import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    data: { title: 'Mon profil' },
  },
  {
    path: 'security',
    loadComponent: () => import('./pages/security/security.component').then(m => m.SecurityComponent),
    data: { title: 'Sécurité' },
  },
  {
    path: 'preferences',
    loadComponent: () => import('./pages/preferences/preferences.component').then(m => m.PreferencesComponent),
    data: { title: 'Préférences' },
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users-management/users-management.component').then(m => m.UsersManagementComponent),
    data: { title: 'Gestion utilisateurs' },
  },
];
