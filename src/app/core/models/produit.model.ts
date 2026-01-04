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
