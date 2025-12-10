import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  standalone: false
})
export class AuthLayoutComponent {}