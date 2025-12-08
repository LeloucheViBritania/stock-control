import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Routing et Composant Racine
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Modules Partagés
import { SharedModule } from '../shared/shared.module';



// Intercepteurs (La sécurité et gestion d'erreur)
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule, // Indispensable pour faire fonctionner les appels API
    AppRoutingModule,
    SharedModule      // Contient votre directive *appIfPremium
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }