import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
      © {{ currentYear }} Gestion de Stock. Tous droits réservés.
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
