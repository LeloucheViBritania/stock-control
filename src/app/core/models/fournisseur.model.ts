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
