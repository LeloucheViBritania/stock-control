import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { LogisticsService } from '../../../../core/services/logistics.service';
import { ProductService } from '../../../../core/services/product.service';
import { Entrepot } from '../../../../../shared/models/logistics.model';
import { Produit } from '../../../../../shared/models/product.model';

@Component({
  selector: 'app-transfer-create',
  templateUrl: './transfer-create.component.html',
  styleUrls: ['./transfer-create.component.scss']
})
export class TransferCreateComponent implements OnInit {
  transferForm?: FormGroup;
  warehouses: Entrepot[] = [];
  products: Produit[] = [];
  
  // Listes filtrées pour l'affichage dynamique
  sourceWarehouses: Entrepot[] = [];
  destWarehouses: Entrepot[] = [];

  constructor(
    private fb: FormBuilder,
    private logisticsService: LogisticsService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.setupDynamicValidation();
  }

  private initForm(): void {
    this.transferForm = this.fb.group({
      entrepotSourceId: [null, Validators.required],
      entrepotDestinationId: [null, Validators.required],
      dateTransfert: [new Date(), Validators.required],
      notes: [''],
      lignes: this.fb.array([]) // Tableau dynamique de produits
    });
    
    // On ajoute une ligne vide par défaut
    this.addProductLine();
  }

  // Getter raccourci pour le template HTML
  get lignes(): FormArray {
    return this.transferForm?.get('lignes') as FormArray;
  }

  addProductLine(): void {
    const lineGroup = this.fb.group({
      produitId: [null, Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]]
    });
    this.lignes.push(lineGroup);
  }

  removeProductLine(index: number): void {
    this.lignes.removeAt(index);
  }

  private loadData(): void {
    // 1. Charger les entrepôts
    this.logisticsService.getWarehouses().subscribe(data => {
      this.warehouses = data;
      this.sourceWarehouses = [...data];
      this.destWarehouses = [...data];
    });

    // 2. Charger les produits (Idéalement, on filtrerait selon l'entrepôt source choisi)
    this.productService.getAll(1, 100).subscribe(res => {
      this.products = res.data || res; 
    });
  }

  private setupDynamicValidation(): void {
    // DYNAMISATION : Quand la source change, on met à jour la liste de destination possible
    this.transferForm?.get('entrepotSourceId')?.valueChanges.subscribe(sourceId => {
      // On filtre la destination pour ne pas afficher l'entrepôt source
      this.destWarehouses = this.warehouses.filter(w => w.id !== +sourceId);
      
      // Si la destination actuelle est devenue invalide (identique à la source), on reset
      const currentDest = this.transferForm?.get('entrepotDestinationId')?.value;
      if (currentDest === sourceId) {
        this.transferForm?.get('entrepotDestinationId')?.setValue(null);
      }
    });
  }

  onSubmit(): void {
    if (this.transferForm?.invalid) return;
    
    // Envoi au backend
    this.logisticsService.createTransfer(this.transferForm?.value).subscribe({
      next: (res) => {
        console.log('Transfert créé:', res);
        // Redirection vers la liste des transferts...
      },
      error: (err) => console.error('Erreur:', err)
    });
  }
}