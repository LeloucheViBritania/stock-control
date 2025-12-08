import { Component, OnInit } from '@angular/core';
import { SalesService, Client } from '../../../../core/services/sales.service';

@Component({
  selector: 'app-client-list',
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between mb-4">
        <h2>Clients</h2>
        <a routerLink="new" class="btn btn-primary">+ Nouveau Client</a>
      </div>
      <div class="row">
        <div class="col-md-4 mb-3" *ngFor="let c of clients">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{{ c.nom }}</h5>
              <p class="card-text text-muted">
                {{ c.email }}<br>
                {{ c.telephone }}
              </p>
              <a [routerLink]="['edit', c.id]" class="btn btn-sm btn-outline-primary">Modifier</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: false
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  constructor(private salesService: SalesService) {}

  ngOnInit() {
    this.salesService.getClients().subscribe(data => this.clients = data);
  }
}