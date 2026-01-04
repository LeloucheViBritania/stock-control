#!/bin/bash
cd /home/claude/gestion-stock-frontend/src/app/core/models

# API Response Model
cat > api-response.model.ts << 'EOF'
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
EOF

# User Model
cat > user.model.ts << 'EOF'
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
EOF

# Auth Model
cat > auth.model.ts << 'EOF'
import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  entrepriseNom?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  tier: string;
  exp: number;
}
EOF

# Produit Model
cat > produit.model.ts << 'EOF'
export interface Produit {
  id: string;
  reference: string;
  nom: string;
  description?: string;
  prixAchat: number;
  prixVente: number;
  quantiteStock: number;
  seuilAlerte: number;
  seuilCritique: number;
  categorieId: string;
  categorie?: { id: string; nom: string };
  fournisseurId?: string;
  fournisseur?: { id: string; nom: string };
  image?: string;
  codeBarres?: string;
  unite: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProduitDto {
  reference: string;
  nom: string;
  description?: string;
  prixAchat: number;
  prixVente: number;
  quantiteStock: number;
  seuilAlerte: number;
  seuilCritique?: number;
  categorieId: string;
  fournisseurId?: string;
  codeBarres?: string;
  unite?: string;
}

export type UpdateProduitDto = Partial<CreateProduitDto>;
EOF

# Categorie Model
cat > categorie.model.ts << 'EOF'
export interface Categorie {
  id: string;
  nom: string;
  description?: string;
  parentId?: string;
  parent?: Categorie;
  children?: Categorie[];
  image?: string;
  produitsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategorieDto {
  nom: string;
  description?: string;
  parentId?: string;
}

export type UpdateCategorieDto = Partial<CreateCategorieDto>;
EOF

# Client Model
cat > client.model.ts << 'EOF'
export interface Client {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  type: 'PARTICULIER' | 'ENTREPRISE';
  entreprise?: string;
  siret?: string;
  notes?: string;
  commandesCount?: number;
  totalAchats?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDto {
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  type?: 'PARTICULIER' | 'ENTREPRISE';
  entreprise?: string;
  siret?: string;
  notes?: string;
}

export type UpdateClientDto = Partial<CreateClientDto>;
EOF

# Fournisseur Model
cat > fournisseur.model.ts << 'EOF'
export interface Fournisseur {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  siteWeb?: string;
  contactNom?: string;
  contactEmail?: string;
  contactTelephone?: string;
  notes?: string;
  evaluation?: number;
  delaiLivraison?: number;
  produitsCount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFournisseurDto {
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  siteWeb?: string;
  contactNom?: string;
  contactEmail?: string;
  contactTelephone?: string;
  notes?: string;
}

export type UpdateFournisseurDto = Partial<CreateFournisseurDto>;
EOF

# Commande Model
cat > commande.model.ts << 'EOF'
import { StatutCommande } from '@enums/statut-commande.enum';
import { Client } from './client.model';

export interface Commande {
  id: string;
  numero: string;
  clientId: string;
  client?: Client;
  statut: StatutCommande;
  dateCommande: Date;
  dateLivraison?: Date;
  lignes: LigneCommande[];
  sousTotal: number;
  taxe: number;
  remise: number;
  total: number;
  notes?: string;
  adresseLivraison?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LigneCommande {
  id: string;
  produitId: string;
  produit?: { id: string; nom: string; reference: string };
  quantite: number;
  prixUnitaire: number;
  remise: number;
  total: number;
}

export interface CreateCommandeDto {
  clientId: string;
  lignes: { produitId: string; quantite: number; prixUnitaire: number; remise?: number }[];
  notes?: string;
  adresseLivraison?: string;
}
EOF

# Mouvement Stock Model
cat > mouvement-stock.model.ts << 'EOF'
import { TypeMouvement } from '@enums/type-mouvement.enum';

export interface MouvementStock {
  id: string;
  type: TypeMouvement;
  produitId: string;
  produit?: { id: string; nom: string; reference: string };
  entrepotId?: string;
  entrepot?: { id: string; nom: string };
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  reference?: string;
  notes?: string;
  userId: string;
  user?: { id: string; nom: string; prenom: string };
  createdAt: Date;
}

export interface CreateMouvementDto {
  type: TypeMouvement;
  produitId: string;
  entrepotId?: string;
  quantite: number;
  reference?: string;
  notes?: string;
}
EOF

# Entrepot Model
cat > entrepot.model.ts << 'EOF'
export interface Entrepot {
  id: string;
  nom: string;
  code: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  responsableId?: string;
  responsable?: { id: string; nom: string; prenom: string };
  telephone?: string;
  email?: string;
  capacite?: number;
  isDefault: boolean;
  isActive: boolean;
  produitsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntrepotDto {
  nom: string;
  code: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  responsableId?: string;
  telephone?: string;
  email?: string;
  capacite?: number;
  isDefault?: boolean;
}

export type UpdateEntrepotDto = Partial<CreateEntrepotDto>;
EOF

# Transfert Model
cat > transfert.model.ts << 'EOF'
import { StatutTransfert } from '@enums/statut-transfert.enum';

export interface Transfert {
  id: string;
  numero: string;
  entrepotSourceId: string;
  entrepotSource?: { id: string; nom: string };
  entrepotDestinationId: string;
  entrepotDestination?: { id: string; nom: string };
  statut: StatutTransfert;
  dateTransfert: Date;
  dateReception?: Date;
  lignes: LigneTransfert[];
  notes?: string;
  userId: string;
  user?: { id: string; nom: string; prenom: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface LigneTransfert {
  id: string;
  produitId: string;
  produit?: { id: string; nom: string; reference: string };
  quantiteDemandee: number;
  quantiteRecue?: number;
}
EOF

# Inventaire Model
cat > inventaire.model.ts << 'EOF'
export interface Inventaire {
  id: string;
  reference: string;
  entrepotId: string;
  entrepot?: { id: string; nom: string };
  dateDebut: Date;
  dateFin?: Date;
  statut: 'EN_COURS' | 'TERMINE' | 'VALIDE';
  lignes: LigneInventaire[];
  userId: string;
  user?: { id: string; nom: string; prenom: string };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LigneInventaire {
  id: string;
  produitId: string;
  produit?: { id: string; nom: string; reference: string };
  quantiteTheorique: number;
  quantiteComptee?: number;
  ecart: number;
  notes?: string;
}
EOF

# Notification Model
cat > notification.model.ts << 'EOF'
export interface Notification {
  id: string;
  type: 'ALERTE_STOCK' | 'COMMANDE' | 'SYSTEME' | 'INFO';
  titre: string;
  message: string;
  lien?: string;
  isRead: boolean;
  userId: string;
  createdAt: Date;
}
EOF

# Dashboard Model
cat > dashboard.model.ts << 'EOF'
export interface DashboardStats {
  produitsTotal: number;
  produitsActifs: number;
  alertesStock: number;
  commandesEnCours: number;
  commandesMois: number;
  chiffreAffaires: number;
  clientsTotal: number;
  mouvementsJour: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}
EOF

# Subscription Model
cat > subscription.model.ts << 'EOF'
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
EOF

# Journal Audit Model
cat > journal-audit.model.ts << 'EOF'
export interface JournalAudit {
  id: string;
  action: string;
  entite: string;
  entiteId: string;
  ancienneValeur?: Record<string, any>;
  nouvelleValeur?: Record<string, any>;
  userId: string;
  user?: { id: string; nom: string; prenom: string; email: string };
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
EOF

# Rapport Model
cat > rapport.model.ts << 'EOF'
export interface RapportConfig {
  type: 'INVENTAIRE' | 'VENTES' | 'MOUVEMENTS' | 'FOURNISSEURS';
  dateDebut: Date;
  dateFin: Date;
  entrepotId?: string;
  categorieId?: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
}

export interface RapportInventaire {
  produits: {
    reference: string;
    nom: string;
    categorie: string;
    quantite: number;
    valeur: number;
    statut: string;
  }[];
  total: number;
  valeurTotale: number;
}
EOF

# Index
cat > index.ts << 'EOF'
export * from './api-response.model';
export * from './user.model';
export * from './auth.model';
export * from './produit.model';
export * from './categorie.model';
export * from './client.model';
export * from './fournisseur.model';
export * from './commande.model';
export * from './mouvement-stock.model';
export * from './entrepot.model';
export * from './transfert.model';
export * from './inventaire.model';
export * from './notification.model';
export * from './dashboard.model';
export * from './subscription.model';
export * from './journal-audit.model';
export * from './rapport.model';
EOF

echo "Models créés"
