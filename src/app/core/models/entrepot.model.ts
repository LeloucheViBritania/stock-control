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
