/**
 * DTO (Data Transfer Object) pour l'authentification.
 * Cette interface représente la charge utile (payload)
 * envoyée par le formulaire de connexion au serveur NestJS.
 * Elle correspond au LoginDto du backend.
 *
 * IMPORTANT: Le backend attend nomUtilisateur (pas email) et motDePasse (pas password)
 */
export interface LoginDto {
  /**
   * Le nom d'utilisateur (unique dans le système)
   */
  nomUtilisateur: string;

  /**
   * Le mot de passe de l'utilisateur
   */
  motDePasse: string;
}