import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="card p-6"><h1 class="text-2xl font-bold">Gestion des Utilisateurs</h1></div>`,
})
export class UsersManagementComponent {}
