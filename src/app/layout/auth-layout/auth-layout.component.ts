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
  styles: [`
    .auth-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f7fb;
    }
    .auth-box {
      width: 100%;
      max-width: 450px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  `],
  standalone: false
})
export class AuthLayoutComponent {}