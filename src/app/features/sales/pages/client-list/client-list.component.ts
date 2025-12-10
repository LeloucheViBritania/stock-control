import { Component, OnInit } from '@angular/core';
import { SalesService, Client } from '../../../../core/services/sales.service';

@Component({
  selector: 'app-client-list',
  templateUrl:'./client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
  standalone: false
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  loading = true;
  
  constructor(private salesService: SalesService) {}

  ngOnInit() {
    this.salesService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }
}