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
