/**
 * DTO (Data Transfer Object) pour l'authentification.
 * Cette interface représente la charge utile (payload)
 * envoyée par le formulaire de connexion au serveur NestJS.
 * Elle correspond au LoginDto du backend.
 */
export interface LoginDto {
  /**
   * L'adresse email de l'utilisateur.
   */
  email: string;

  /**
   * Le mot de passe de l'utilisateur.
   */
  password: string;
}