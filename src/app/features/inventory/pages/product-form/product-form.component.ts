import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProductService } from '../../../../core/services/product.service';
import { TierAbonnement } from '../../../../../shared/models/enums.model';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isPremium = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.isPremium = this.authService.isPremium();
    this.initForm();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      reference: ['', [Validators.required, Validators.maxLength(50)]], //
      nom: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      categorieId: [null],
      
      // Prix & Taxes
      coutUnitaire: [0, [Validators.min(0)]],
      prixVente: [0, [Validators.min(0)]], //
      tauxTaxe: [0, [Validators.min(0), Validators.max(100)]],

      // Logique Conditionnelle
      // Si Gratuit : On initialise avec un champ requis
      // Si Premium : On peut ne pas mettre ce champ ou le laisser à 0 (calculé ailleurs)
      quantiteStock: [{ value: 0, disabled: this.isPremium }, [Validators.min(0)]],
      
      // Seuils d'alerte (Pour tout le monde)
      niveauStockMin: [0], //
      pointCommande: [0]
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    
    const formData = this.productForm.getRawValue();
    
    // Nettoyage avant envoi
    if (this.isPremium) {
      // En Premium, on ignore la quantité directe lors de la création du produit
      // Le stock sera ajouté via un "Bon de réception" ou "Ajustement de stock"
      delete formData.quantiteStock; 
    }

    this.productService.create(formData).subscribe({
      next: (res) => {
        console.log('Produit créé avec succès', res);
        // Redirection...
      },
      error: (err) => console.error(err)
    });
  }
}