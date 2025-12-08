import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Layouts (Les cadres de votre application)
import { AuthLayoutComponent } from '../layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from '../layout/main-layout/main-layout.component';

@NgModule({
  declarations: [
    // On déclare nos deux layouts principaux ici pour qu'ils soient utilisables par le router
    AuthLayoutComponent,
    MainLayoutComponent
  ],
  imports: [HttpClientModule],
  providers: [
    // L'ordre est important !
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class CoreModule {
  // Empêcher l'importation multiple du CoreModule
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule est déjà chargé. Importez-le uniquement dans AppModule.');
    }
  }
}