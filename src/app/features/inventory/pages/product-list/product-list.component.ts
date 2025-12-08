import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { Produit } from '../../../../../shared/models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
,
  standalone: false
})
export class ProductListComponent implements OnInit {
  products: Produit[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll(1, 100).subscribe({
      next: (res) => {
        // Adaptez selon si votre API renvoie { data: [...] } ou directement [...]
        this.products = res.data || res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.productService.delete(id).subscribe(() => {
        this.products = this.products.filter(p => p.id !== id);
      });
    }
  }
}