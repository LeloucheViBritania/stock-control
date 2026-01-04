import { TierAbonnement } from '@enums/tier-abonnement.enum';

export interface Subscription {
  id: string;
  entrepriseId: string;
  tier: TierAbonnement;
  dateDebut: Date;
  dateFin?: Date;
  isActive: boolean;
  montant: number;
  periodicite: 'MENSUEL' | 'ANNUEL';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  nom: string;
  tier: TierAbonnement;
  prixMensuel: number;
  prixAnnuel: number;
  features: string[];
  isPopular?: boolean;
}
