/**
 * Point d'entrée principal de l'application Angular
 * Gestion de Stock Frontend
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Bootstrap l'application avec la configuration
bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('🚀 Application Gestion de Stock démarrée avec succès!');
  })
  .catch((err) => {
    console.error('❌ Erreur lors du démarrage de l\'application:', err);
  });
