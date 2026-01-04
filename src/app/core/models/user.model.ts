import { Role } from '@enums/role.enum';
import { TierAbonnement } from '@enums/tier-abonnement.enum';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  tier: TierAbonnement;
  avatar?: string;
  telephone?: string;
  entrepriseId?: string;
  entrepriseNom?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
