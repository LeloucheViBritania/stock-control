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
export interface AuthResponse {
  accessToken: string;
  user: Utilisateur;
}