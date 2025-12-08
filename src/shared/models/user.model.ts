import { Role, TierAbonnement } from './enums.model';

export interface Utilisateur {
  id: number;
  nomUtilisateur: string;
  email: string;
  nomComplet?: string;
  role: Role;
  estActif: boolean;
  tierAbonnement: TierAbonnement; // Point clé pour le frontend
  dateExpiration?: Date;
  dateCreation: Date;
}

// Réponse typique d'un login (JWT + Info user)
// IMPORTANT: Le backend retourne "access_token" et "utilisateur" (format snake_case API)
export interface AuthResponse {
  access_token: string;
  utilisateur: Utilisateur;
}