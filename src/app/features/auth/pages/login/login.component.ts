import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoginDto } from '../../../../core/auth/dto/login.dto';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  returnUrl?: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      nomUtilisateur: ['', [Validators.required, Validators.minLength(3)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Récupérer l'URL de retour si on a été redirigé
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value as LoginDto).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.error = err.error?.message || "Nom d'utilisateur ou mot de passe incorrect";
        this.loading = false;
      }
    });
  }
}