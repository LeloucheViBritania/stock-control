import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IfPremiumDirective } from './directives/if-premium.directive';

@NgModule({
  declarations: [
    IfPremiumDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule, // Indispensable pour [formGroup]
    FormsModule,
    IfPremiumDirective // Export directive for templates
  ]
})
export class SharedModule { }