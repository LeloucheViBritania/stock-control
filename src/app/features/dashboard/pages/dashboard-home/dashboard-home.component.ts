import { Component, OnInit } from '@angular/core';
import { DashboardStats } from '../../../../core/services/dashboard.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
  standalone: false
})
export class DashboardHomeComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;
  currentDate = new Date();

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    // Simuler un chargement avec des données de démo
    setTimeout(() => {
      this.stats = this.getMockStats();
      this.isLoading = false;
    }, 500);
  }

  private getMockStats(): DashboardStats {
    return {
      totalProduits: 1325,
      alerteStock: 5,
      commandesEnAttente: 12,
      totalVentes: 32500,
      totalClients: 958,
      totalFournisseurs: 540,
      valeurStock: 154300,
      recentInvoices: [
        { numero: 132, client: 'Cameron Williamson', date: '2020-11-12', montant: 500, statut: 'paid' },
        { numero: 132, client: 'Cody Fisher', date: '2020-06-05', montant: 75, statut: 'paid' },
        { numero: 432, client: 'Eleanor Pena', date: '2020-07-22', montant: 135, statut: 'due' },
        { numero: 32, client: 'Ronald Richards', date: '2020-05-11', montant: 56, statut: 'paid' },
        { numero: 502, client: 'Wade Warren', date: '2020-08-10', montant: 320, statut: 'due' }
      ],
      topProduits: [
        { code: 'CA032', nom: 'Potato Chips', quantite: 862, montant: 5320 },
        { code: 'PA602', nom: 'French Fries', quantite: 734, montant: 4520 },
        { code: 'CA002', nom: 'Chicken Pot Pie', quantite: 720, montant: 3950 },
        { code: 'LF530', nom: 'Ice Cream', quantite: 598, montant: 2875 },
        { code: 'DA334', nom: 'Ice Cream Cake', quantite: 529, montant: 2347 }
      ],
      todoList: [
        { id: 1, date: '18 Jul, 2020', title: 'Meet a new supplier', icon: '📦', color: '#FF8A80' },
        { id: 2, date: '20 Jun, 2020', title: 'Replenish stocks', icon: '📊', color: '#FFD180' },
        { id: 3, date: '28 Apr, 2020', title: 'Buy new products', icon: '🔒', color: '#B388FF' },
        { id: 4, date: '13 Mar, 2020', title: 'Take stock inventory', icon: '📋', color: '#82B1FF' }
      ]
    };
  }
}
