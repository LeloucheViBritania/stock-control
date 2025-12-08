import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Directives
import { IfPremiumDirective } from './directives/if-premium.directive';

// Components (Exemples)
// import { LoadingSpinnerComponent } from './components/loading-spinner.component';

@NgModule({
  declarations: [
    IfPremiumDirective
    // LoadingSpinnerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IfPremiumDirective // INDISPENSABLE pour l'utiliser dans les autres modules
    // LoadingSpinnerComponent
  ]
})
export class SharedModule { }