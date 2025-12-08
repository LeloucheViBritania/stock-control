import { Component, OnInit } from '@angular/core';
import { LogisticsService } from '../../../../core/services/logistics.service';
import { Entrepot } from '../../../../../shared/models/logistics.model';

@Component({
  selector: 'app-warehouse-list',
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Mes Entrepôts</h2>
        <button routerLink="new" class="btn btn-primary">+ Nouvel Entrepôt</button>
      </div>

      <div class="row">
        <div class="col-md-4 mb-3" *ngFor="let w of warehouses">
          <div class="card h-100 warehouse-card">
            <div class="card-body">
              <h5 class="card-title">{{ w.nom }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">Code: {{ w.code }}</h6>
              
              <p class="card-text">
                <i class="icon-location"></i> {{ w.ville || 'Ville non définie' }}<br>
                <span class="badge" [ngClass]="w.estActif ? 'bg-success' : 'bg-danger'">
                  {{ w.estActif ? 'Actif' : 'Inactif' }}
                </span>
              </p>
            </div>
            <div class="card-footer bg-transparent border-top-0">
              <button [routerLink]="['edit', w.id]" class="btn btn-sm btn-outline-secondary">Modifier</button>
              <button class="btn btn-sm btn-outline-info ms-2">Voir Stock</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .warehouse-card { transition: transform 0.2s; }
    .warehouse-card:hover { transform: translateY(-5px); shadow: 0 4px 8px rgba(0,0,0,0.1); }
  `]
})
export class WarehouseListComponent implements OnInit {
  warehouses: Entrepot[] = [];

  constructor(private logisticsService: LogisticsService) {}

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.logisticsService.getWarehouses().subscribe(data => this.warehouses = data);
  }
}