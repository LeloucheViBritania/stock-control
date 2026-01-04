/**
 * Enum des rôles utilisateur
 */
export enum Role {
  ADMIN = 'ADMIN',
  GESTIONNAIRE = 'GESTIONNAIRE',
  EMPLOYE = 'EMPLOYE',
}

/**
 * Labels des rôles en français
 */
export const RoleLabels: Record<Role, string> = {
  [Role.ADMIN]: 'Administrateur',
  [Role.GESTIONNAIRE]: 'Gestionnaire',
  [Role.EMPLOYE]: 'Employé',
};
