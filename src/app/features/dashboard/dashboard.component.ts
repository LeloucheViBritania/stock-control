import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
,
  standalone: false
})
export class DashboardComponent implements OnInit {
  stats: any = {}; // Rempli par le service

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Appel API pour charger les stats (le backend filtrera déjà les données)
  }
}