// ============================================
// STOCK CONTROL - DATA MODELS
// ============================================

// ============================================
// ENUMS
// ============================================
export enum Role {
  ADMIN = 'ADMIN',
  GESTIONNAIRE = 'GESTIONNAIRE',
  EMPLOYE = 'EMPLOYE'
}

export enum TierAbonnement {
  GRATUIT = 'GRATUIT',
  PREMIUM = 'PREMIUM'
}

export enum StatutCommande {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_TRAITEMENT = 'EN_TRAITEMENT',
  EXPEDIE = 'EXPEDIE',
  LIVRE = 'LIVRE',
  ANNULE = 'ANNULE'
}

export enum TypeMouvement {
  ENTREE = 'ENTREE',
  SORTIE = 'SORTIE',
  AJUSTEMENT = 'AJUSTEMENT',
  TRANSFERT = 'TRANSFERT',
  RETOUR = 'RETOUR'
}

export enum StatutBonCommande {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  RECU = 'RECU',
  ANNULE = 'ANNULE'
}

export enum StatutTransfert {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_TRANSIT = 'EN_TRANSIT',
  RECU = 'RECU',
  COMPLETE = 'COMPLETE',
  ANNULE = 'ANNULE'
}

export enum RaisonAjustement {
  INVENTAIRE_PHYSIQUE = 'INVENTAIRE_PHYSIQUE',
  DOMMAGE = 'DOMMAGE',
  PERTE = 'PERTE',
  TROUVE = 'TROUVE',
  CORRECTION = 'CORRECTION',
  AUTRE = 'AUTRE'
}

export enum StatutClient {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  BLOQUE = 'BLOQUE',
  SUSPENDU = 'SUSPENDU'
}

export enum SegmentClient {
  NOUVEAU = 'NOUVEAU',
  REGULIER = 'REGULIER',
  VIP = 'VIP',
  INACTIF = 'INACTIF'
}

export enum StatutSessionInventaire {
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  VALIDE = 'VALIDE',
  ANNULE = 'ANNULE'
}

export enum StatutDevis {
  BROUILLON = 'BROUILLON',
  ENVOYE = 'ENVOYE',
  ACCEPTE = 'ACCEPTE',
  REFUSE = 'REFUSE',
  EXPIRE = 'EXPIRE',
  CONVERTI = 'CONVERTI'
}

// ============================================
// INTERFACES - AUTH
// ============================================
export interface LoginRequest {
  nomUtilisateur: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nomUtilisateur: string;
  email: string;
  motDePasse: string;
  nomComplet?: string;
  role?: Role;
}

export interface AuthResponse {
  access_token: string;
  utilisateur: Utilisateur;
}

export interface Utilisateur {
  id: number;
  nomUtilisateur: string;
  email: string;
  nomComplet?: string;
  role: Role;
  tierAbonnement: TierAbonnement;
  dateExpiration?: Date;
  estActif: boolean;
  dateCreation: Date;
  dateModification?: Date;
}

// ============================================
// INTERFACES - PRODUITS
// ============================================
export interface Produit {
  id: number;
  reference: string;
  nom: string;
  description?: string;
  categorieId?: number;
  categorie?: Categorie;
  marque?: string;
  uniteMesure: string;
  poids?: number;
  dimensions?: string;
  codeBarre?: string;
  niveauStockMin: number;
  niveauStockMax?: number;
  pointCommande?: number;
  coutUnitaire?: number;
  prixVente?: number;
  tauxTaxe: number;
  quantiteStock: number;
  estActif: boolean;
  dateCreation: Date;
  dateModification: Date;
  produitsFournisseurs?: ProduitFournisseur[];
  _count?: {
    produitsFournisseurs: number;
  };
}

export interface CreateProduitRequest {
  reference: string;
  nom: string;
  description?: string;
  categorieId?: number;
  marque?: string;
  uniteMesure?: string;
  poids?: number;
  dimensions?: string;
  codeBarre?: string;
  niveauStockMin?: number;
  niveauStockMax?: number;
  pointCommande?: number;
  coutUnitaire?: number;
  prixVente?: number;
  tauxTaxe?: number;
  quantiteStock?: number;
}

export interface AjusterStockRequest {
  type: 'entree' | 'sortie';
  quantite: number;
  raison: string;
  notes?: string;
}

// ============================================
// INTERFACES - CATEGORIES
// ============================================
export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  parentId?: number;
  parent?: Categorie;
  categorieParenteId?: number;
  categorieParente?: Categorie;
  sousCategories?: Categorie[];
  dateCreation: Date;
  estActif: boolean;
  _count?: {
    produits: number;
    sousCategories: number;
  };
}

export interface CreateCategorieRequest {
  nom: string;
  description?: string;
  categorieParenteId?: number;
}

// ============================================
// INTERFACES - CLIENTS
// ============================================
export interface Client {
  id: number;
  nom: string;
  entreprise?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  numeroFiscal?: string;
  estActif: boolean;
  dateCreation: Date;
  statut: StatutClient;
  segment: SegmentClient;
  limiteCredit: number;
  conditionsPaiement?: string;
  notes?: string;
  chiffreAffaires?: number;
  encours?: number;
  commandes?: Commande[];
  statistiques?: StatistiquesClient;
  _count?: {
    commandes: number;
  };
}

export interface CreateClientRequest {
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  numeroFiscal?: string;
  limiteCredit?: number;
  conditionsPaiement?: string;
}

export interface EncoursClient {
  id: number;
  clientId: number;
  limiteCredit: number;
  montantFactureTotal: number;
  montantPaye: number;
  soldeActuel: number;
  montantEchu: number;
  montantNonEchu: number;
  creditDisponible: number;
  tauxUtilisationCredit: number;
  scoreCredit: number;
}

export interface StatistiquesClient {
  id: number;
  clientId: number;
  nombreCommandesTotal: number;
  nombreCommandesAnnee: number;
  nombreCommandesMois: number;
  caTotal: number;
  caAnnee: number;
  caMois: number;
  panierMoyen: number;
  frequenceAchat: number;
  datePremiereCommande?: Date;
  dateDerniereCommande?: Date;
  joursDepuisDernierAchat: number;
  segment: SegmentClient;
  valeurClient: number;
}

// ============================================
// INTERFACES - FOURNISSEURS
// ============================================
export interface Fournisseur {
  id: number;
  nom: string;
  code?: string;
  siret?: string;
  personneContact?: string;
  contactPrincipal?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  numeroFiscal?: string;
  conditionsPaiement?: string;
  delaiLivraisonMoyen?: number;
  noteGlobale?: number;
  notes?: string;
  estActif: boolean;
  dateCreation: Date;
  dateModification: Date;
  produitsFournisseurs?: ProduitFournisseur[];
  statistiques?: StatistiquesFournisseur;
  _count?: {
    produitsFournisseurs: number;
    bonsCommande: number;
  };
}

export interface CreateFournisseurRequest {
  nom: string;
  code?: string;
  personneContact?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  numeroFiscal?: string;
  conditionsPaiement?: string;
}

export interface ProduitFournisseur {
  id: number;
  produitId: number;
  produit?: Produit;
  fournisseurId: number;
  fournisseur?: Fournisseur;
  referenceFournisseur?: string;
  delaiLivraisonJours?: number;
  quantiteMinimumCommande: number;
  prixUnitaire?: number;
  estPrefere: boolean;
  dateCreation: Date;
}

export interface StatistiquesFournisseur {
  id: number;
  fournisseurId: number;
  nombreCommandesTotal: number;
  montantTotal: number;
  delaiMoyenLivraison: number;
  tauxConformite: number;
  scoreGlobal: number;
}

// ============================================
// INTERFACES - COMMANDES
// ============================================
export interface Commande {
  id: number;
  numeroCommande: string;
  clientId?: number;
  client?: Client;
  entrepotId?: number;
  entrepot?: Entrepot;
  dateCommande: Date;
  dateLivraison?: Date;
  dateLivraisonPrevue?: Date;
  statut: StatutCommande;
  sousTotal?: number;
  remise?: number;
  taxe?: number;
  montantTotal?: number;
  notes?: string;
  creePar?: number;
  utilisateur?: Utilisateur;
  lignes?: LigneCommande[];
  lignesCommande?: LigneCommande[];
  dateCreation: Date;
  dateModification: Date;
}

export interface LigneCommande {
  id: number;
  commandeId: number;
  produitId: number;
  produit?: Produit;
  quantite: number;
  prixUnitaire: number;
  sousTotal?: number;
  seuilAlerte: boolean;
}

export interface CreateCommandeRequest {
  clientId?: number;
  entrepotId?: number;
  dateCommande: Date;
  dateLivraison?: Date;
  lignes: CreateLigneCommandeRequest[];
}

export interface CreateLigneCommandeRequest {
  produitId: number;
  quantite: number;
  prixUnitaire: number;
}

// ============================================
// INTERFACES - MOUVEMENTS STOCK
// ============================================
export interface MouvementStock {
  id: number;
  produitId: number;
  produit?: Produit;
  entrepotId?: number;
  entrepot?: Entrepot;
  typeMouvement: TypeMouvement;
  quantite: number;
  typeReference?: string;
  referenceId?: number;
  raison?: string;
  coutUnitaire?: number;
  effectuePar?: number;
  utilisateur?: Utilisateur;
  dateMouvement: Date;
  notes?: string;
}

// ============================================
// INTERFACES - ENTREPOTS (PREMIUM)
// ============================================
export interface Entrepot {
  id: number;
  nom: string;
  code?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  telephone?: string;
  responsableId?: number;
  responsable?: Utilisateur;
  capacite?: number;
  estPrincipal: boolean;
  estActif: boolean;
  dateCreation: Date;
  _count?: {
    inventaires: number;
    inventaire: number;
    commandes: number;
    mouvementsOrigine: number;
  };
}

export interface CreateEntrepotRequest {
  nom: string;
  code: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  responsableId?: number;
  capacite?: number;
}

// ============================================
// INTERFACES - INVENTAIRE (PREMIUM)
// ============================================
export interface Inventaire {
  id: number;
  produitId: number;
  produit?: Produit;
  entrepotId: number;
  entrepot?: Entrepot;
  quantite: number;
  quantiteReservee: number;
  emplacement?: string;
  derniereVerification?: Date;
  dateModification: Date;
}

export interface CreateInventaireRequest {
  produitId: number;
  entrepotId: number;
  quantite: number;
  emplacement?: string;
}

export interface AjusterQuantiteRequest {
  quantite: number;
  raison: string;
  notes?: string;
}

export interface ReserverStockRequest {
  quantite: number;
  reference?: string;
}

// ============================================
// INTERFACES - TRANSFERTS STOCK (PREMIUM)
// ============================================
export interface TransfertStock {
  id: number;
  reference?: string;
  numeroTransfert: string;
  entrepotOrigineId?: number;
  entrepotOrigine?: Entrepot;
  entrepotSourceId: number;
  entrepotSource?: Entrepot;
  entrepotDestinationId: number;
  entrepotDestination?: Entrepot;
  statut: StatutTransfert;
  dateTransfert: Date;
  dateReception?: Date;
  creePar?: number;
  utilisateur?: Utilisateur;
  notes?: string;
  lignes?: LigneTransfertStock[];
  dateCreation: Date;
  _count?: {
    lignes: number;
  };
}

export interface LigneTransfertStock {
  id: number;
  transfertId: number;
  produitId: number;
  produit?: Produit;
  quantite?: number;
  quantiteDemandee: number;
  quantiteEnvoyee?: number;
  quantiteRecue?: number;
}

export interface CreateTransfertRequest {
  entrepotSourceId: number;
  entrepotDestinationId: number;
  dateTransfert: Date;
  notes?: string;
  lignes: CreateLigneTransfertRequest[];
}

export interface CreateLigneTransfertRequest {
  produitId: number;
  quantiteDemandee: number;
}

// ============================================
// INTERFACES - BON COMMANDE ACHAT (PREMIUM)
// ============================================
export interface BonCommandeAchat {
  id: number;
  numeroCommande: string;
  fournisseurId: number;
  fournisseur?: Fournisseur;
  entrepotId: number;
  entrepot?: Entrepot;
  statut: StatutBonCommande;
  dateCommande: Date;
  dateLivraisonPrevue?: Date;
  montantTotal?: number;
  notes?: string;
  creePar?: number;
  utilisateur?: Utilisateur;
  lignes?: LigneBonCommandeAchat[];
  dateCreation: Date;
}

export interface LigneBonCommandeAchat {
  id: number;
  bonCommandeId: number;
  produitId: number;
  produit?: Produit;
  quantiteCommandee: number;
  quantiteRecue: number;
  prixUnitaire?: number;
}

// ============================================
// INTERFACES - AJUSTEMENTS STOCK (PREMIUM)
// ============================================
export interface AjustementStock {
  id: number;
  numeroAjustement: string;
  entrepotId: number;
  entrepot?: Entrepot;
  raison: RaisonAjustement;
  statut: string;
  notes?: string;
  dateAjustement: Date;
  approuvePar?: number;
  utilisateurApprobation?: Utilisateur;
  creePar?: number;
  utilisateur?: Utilisateur;
  lignes?: LigneAjustementStock[];
  dateCreation: Date;
}

export interface LigneAjustementStock {
  id: number;
  ajustementId: number;
  produitId: number;
  produit?: Produit;
  quantiteActuelle: number;
  quantiteAjustee: number;
}

// ============================================
// INTERFACES - INVENTAIRE PHYSIQUE (PREMIUM)
// ============================================
export interface SessionInventairePhysique {
  id: number;
  reference: string;
  nom: string;
  entrepotId: number;
  entrepot?: Entrepot;
  categorieId?: number;
  categorie?: Categorie;
  statut: StatutSessionInventaire;
  dateDebut: Date;
  dateFin?: Date;
  notes?: string;
  creePar: number;
  utilisateurCreation?: Utilisateur;
  validePar?: number;
  utilisateurValidation?: Utilisateur;
  lignes?: LigneInventairePhysique[];
  dateCreation: Date;
}

export interface LigneInventairePhysique {
  id: number;
  sessionId: number;
  produitId: number;
  produit?: Produit;
  emplacement?: string;
  quantiteTheorique: number;
  quantiteComptee?: number;
  ecart?: number;
  comptePar?: number;
  dateComptage?: Date;
  recomptage: boolean;
  quantiteRecomptee?: number;
  recomptePar?: number;
  dateRecomptage?: Date;
  notes?: string;
}

// ============================================
// INTERFACES - JOURNAL AUDIT (PREMIUM)
// ============================================
export interface JournalAudit {
  id: number;
  utilisateurId?: number;
  utilisateur?: Utilisateur;
  action: string;
  entite?: string;
  entiteId?: number;
  nomTable?: string;
  enregistrementId?: number;
  anciennesValeurs?: any;
  nouvellesValeurs?: any;
  details?: any;
  adresseIp?: string;
  dateAction?: Date;
  dateCreation: Date;
}

// ============================================
// INTERFACES - DEVIS
// ============================================
export interface Devis {
  id: number;
  numeroDevis: string;
  clientId: number;
  client?: Client;
  statut: StatutDevis;
  dateCreation: Date;
  dateValidite: Date;
  montantHT: number;
  montantTTC: number;
  notes?: string;
  creePar: number;
  utilisateur?: Utilisateur;
  lignes?: LigneDevis[];
}

export interface LigneDevis {
  id: number;
  devisId: number;
  produitId: number;
  produit?: Produit;
  quantite: number;
  prixUnitaire: number;
  remise: number;
  montantHT: number;
}

// ============================================
// INTERFACES - DASHBOARD
// ============================================
export interface DashboardStats {
  totalProduits: number;
  produitsActifs: number;
  stockFaible: number;
  valeurTotaleStock: number;
  totalCommandes: number;
  commandesEnCours: number;
  totalClients: number;
  clientsActifs: number;
  totalFournisseurs: number;
  ventesJour: number;
  ventesSemaine: number;
  ventesMois: number;
}

export interface AlerteStock {
  id: number;
  produit: Produit;
  quantiteActuelle: number;
  seuilMinimum: number;
  entrepot?: Entrepot;
}

// ============================================
// INTERFACES - PAGINATION
// ============================================
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// INTERFACES - API RESPONSE
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
