import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: false
})
export class MainLayoutComponent {
  
  constructor(
    public authService: AuthService, 
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}