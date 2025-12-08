import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm?: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      nomUtilisateur: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm?.invalid) return;

    this.loading = true;
    // Note : Assurez-vous que votre AuthService a une méthode register()
    // Si elle n'existe pas, il faudra l'ajouter (voir note plus bas)
    this.authService.register(this.registerForm?.value).subscribe({
      next: () => {
        // Redirection vers le login après succès
        this.router.navigate(['/auth/login'], { queryParams: { registered: true } });
      },
      error: (err) => {
        this.error = err.error?.message || "Erreur lors de l'inscription";
        this.loading = false;
      }
    });
  }
}