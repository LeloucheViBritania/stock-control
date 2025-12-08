import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService } from '../../../../core/services/sales.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  form?: FormGroup;
  isEdit = false;
  id: number= 0;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.isEdit = !!this.id;

    this.form = this.fb.group({
      nom: ['', [Validators.required]],
      email: ['', [Validators.email]],
      telephone: [''],
      adresse: [''],
      ville: [''],
      pays: [''],
      estActif: [true]
    });

    if (this.isEdit) {
      this.salesService.getClient(this.id).subscribe(data => {
        this.form?.patchValue(data);
      });
    }
  }

  onSubmit(): void {
    if (this.form?.invalid) return;

    const req = this.isEdit
      ? this.salesService.updateClient(this.id, this.form?.value)
      : this.salesService.createClient(this.form?.value);

    req.subscribe({
      next: () => this.router.navigate(['/sales/clients']),
      error: (err) => console.error(err)
    });
  }
}