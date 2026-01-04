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
