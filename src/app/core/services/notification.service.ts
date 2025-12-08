import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  /**
   * Affiche une notification de succès
   * @param message Le message à afficher
   * @param title Le titre (optionnel)
   */
  success(message: string, title: string = 'Succès'): void {
    this.toastr.success(message, title);
  }

  /**
   * Affiche une notification d'erreur
   * @param message Le message à afficher
   * @param title Le titre (optionnel)
   */
  error(message: string, title: string = 'Erreur'): void {
    this.toastr.error(message, title);
  }

  /**
   * Affiche une notification d'avertissement
   * @param message Le message à afficher
   * @param title Le titre (optionnel)
   */
  warning(message: string, title: string = 'Attention'): void {
    this.toastr.warning(message, title);
  }

  /**
   * Affiche une notification d'information
   * @param message Le message à afficher
   * @param title Le titre (optionnel)
   */
  info(message: string, title: string = 'Information'): void {
    this.toastr.info(message, title);
  }

  /**
   * Gère les erreurs HTTP et affiche un message approprié
   * @param error L'erreur HTTP
   * @param customMessage Message personnalisé (optionnel)
   */
  handleError(error: any, customMessage?: string): void {
    let errorMessage = customMessage || 'Une erreur est survenue';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Requête invalide';
          break;
        case 401:
          errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
          break;
        case 403:
          errorMessage = 'Accès refusé';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.statusText}`;
      }
    }

    this.error(errorMessage);
  }
}
