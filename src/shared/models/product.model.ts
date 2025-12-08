export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  categorieParenteId?: number;
}

export interface Produit {
  id: number;
  reference: string;
  nom: string;
  description?: string;
  categorieId?: number;
  categorie?: Categorie;
  
  // Données physiques
  marque?: string;
  uniteMesure: string;
  poids?: number;
  
  // Prix
  coutUnitaire?: number;
  prixVente?: number;
  tauxTaxe: number;
  
  // LOGIQUE STOCK (Le coeur du sujet)
  // Utilisé par le Tier GRATUIT
  quantiteStock: number; 
  
  // Seuils
  niveauStockMin: number;
  pointCommande?: number;
  
  estActif: boolean;
}