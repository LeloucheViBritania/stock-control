import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { PurchaseService, Fournisseur } from '../../../../core/services/purchase.service';
import { LogisticsService } from '../../../../core/services/logistics.service';
import { ProductService } from '../../../../core/services/product.service';
import { Entrepot } from '../../../../../shared/models/logistics.model';
import { Produit } from '../../../../../shared/models/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-order-create',
  templateUrl: './purchase-order-create.component.html'
})
export class PurchaseOrderCreateComponent implements OnInit {
  orderForm?: FormGroup;
  suppliers: Fournisseur[] = [];
  warehouses: Entrepot[] = [];
  products: Produit[] = [];
  loading = true;

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private logisticsService: LogisticsService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      fournisseurId: [null, Validators.required],
      entrepotId: [null, Validators.required], // Entrepôt de destination
      dateLivraisonPrevue: [''],
      notes: [''],
      lignes: this.fb.array([], Validators.min(1)) // Au moins une ligne requise
    });
    
    // Ajout d'une première ligne vide par défaut
    this.addProductLine();
  }

  private loadData(): void {
    // Note: Utilisation de forkJoin si les appels API sont rapides et indépendants
    this.purchaseService.getSuppliers().subscribe(data => this.suppliers = data);
    
    this.logisticsService.getWarehouses().subscribe(data => this.warehouses = data);
    
    // On charge une liste de produits simplifiée
    this.productService.getAll(1, 200).subscribe(res => {
      this.products = res.data || res;
      this.loading = false;
    });
  }

  // Getter pour accéder facilement au FormArray dans le template
  get lignes(): FormArray {
    return this.orderForm?.get('lignes') as FormArray;
  }

  addProductLine(): void {
    const lineGroup = this.fb.group({
      produitId: [null, Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]]
    });
    this.lignes.push(lineGroup);
  }

  removeProductLine(index: number): void {
    this.lignes.removeAt(index);
  }

  // Fonction utilitaire pour le calcul du total HT dans le template
  calculateTotal(): number {
    return this.lignes.controls.reduce((total, control) => {
      const quantite = control.get('quantite')?.value || 0;
      const prix = control.get('prixUnitaire')?.value || 0;
      return total + (quantite * prix);
    }, 0);
  }

  onSubmit(): void {
    if (this.orderForm?.invalid) {
        alert('Veuillez corriger les erreurs dans le formulaire, notamment ajouter au moins un produit.');
        return;
    }

    this.purchaseService.createOrder(this.orderForm?.value).subscribe({
      next: (res) => {
        alert(`Bon de commande ${res.numeroCommande} créé avec succès.`);
        this.router.navigate(['/purchases/orders']); // Rediriger vers la liste des commandes
      },
      error: (err) => console.error("Erreur lors de la création du bon de commande:", err)
    });
  }
}