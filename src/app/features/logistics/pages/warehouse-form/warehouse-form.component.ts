import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LogisticsService } from '../../../../core/services/logistics.service';

@Component({
  selector: 'app-warehouse-form',
  templateUrl: './warehouse-form.component.html',
  styleUrls: ['./warehouse-form.component.scss'],
  standalone: false
})
export class WarehouseFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  id: number= 0;

  constructor(
    private fb: FormBuilder,
    private logisticsService: LogisticsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isEditMode = !!this.id;
    
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(20)]], // Unique constraint gérée par backend
      adresse: [''],
      ville: [''],
      pays: [''],
      estActif: [true]
    });

    if (this.isEditMode) {
      this.logisticsService.getWarehouse(this.id).subscribe(data => {
        this.form.patchValue(data);
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const request$ = this.isEditMode
      ? this.logisticsService.updateWarehouse(this.id, this.form.value) // Méthode à ajouter au service
      : this.logisticsService.createWarehouse(this.form.value);

    request$.subscribe({
      next: () => this.router.navigate(['/logistics/warehouses']),
      error: (err) => alert('Erreur lors de la sauvegarde : ' + err)
    });
  }
}