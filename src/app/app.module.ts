import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Assurez-vous d'importer ceci
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';

// Layouts et Composants Standalone (Importations conservées)
import { AppComponent } from './app.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LandingPageComponent } from './features/public/landing-page/landing-page.component';

// Modules
import { SharedModule } from '../shared/shared.module';

// Interceptors
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';


@NgModule({
  // NG6008 FIX: Les composants Standalone ne doivent PAS être dans declarations
  declarations: [
    AppComponent,
    AuthLayoutComponent,
    MainLayoutComponent,
    LandingPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  // Note: Dans les projets Angular modernes, 'bootstrap' pointe vers le composant racine 'AppComponent'
  bootstrap: [AppComponent]
})
export class AppModule { }