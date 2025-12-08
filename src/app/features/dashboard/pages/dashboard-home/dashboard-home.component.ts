import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardStats } from '../../../../core/services/dashboard.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;
  currentDate = new Date();

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement dashboard', err);
        this.isLoading = false;
      }
    });
  }
}