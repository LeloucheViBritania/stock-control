import { Component, OnInit } from '@angular/core';
import { LogisticsService } from '../../../../core/services/logistics.service';
import { Entrepot } from '../../../../../shared/models/logistics.model';

@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.scss'],
  standalone: false
})
export class WarehouseListComponent implements OnInit {
  warehouses: Entrepot[] = [];
  loading = true;

  constructor(private logisticsService: LogisticsService) {}

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.loading = true;
    this.logisticsService.getWarehouses().subscribe({
      next: (data) => {
        this.warehouses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des entrepôts:', err);
        this.loading = false;
      }
    });
  }
}