import { Role } from '@enums/role.enum';

export const PERMISSIONS = {
  // Produits
  PRODUITS_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  PRODUITS_CREATE: [Role.ADMIN, Role.GESTIONNAIRE],
  PRODUITS_UPDATE: [Role.ADMIN, Role.GESTIONNAIRE],
  PRODUITS_DELETE: [Role.ADMIN],

  // Categories
  CATEGORIES_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  CATEGORIES_MANAGE: [Role.ADMIN, Role.GESTIONNAIRE],

  // Clients
  CLIENTS_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  CLIENTS_MANAGE: [Role.ADMIN, Role.GESTIONNAIRE],

  // Fournisseurs
  FOURNISSEURS_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  FOURNISSEURS_MANAGE: [Role.ADMIN, Role.GESTIONNAIRE],

  // Commandes
  COMMANDES_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  COMMANDES_CREATE: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  COMMANDES_UPDATE: [Role.ADMIN, Role.GESTIONNAIRE],
  COMMANDES_DELETE: [Role.ADMIN],

  // Mouvements Stock
  MOUVEMENTS_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  MOUVEMENTS_CREATE: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],

  // Entrepots (PREMIUM)
  ENTREPOTS_MANAGE: [Role.ADMIN, Role.GESTIONNAIRE],

  // Rapports (PREMIUM)
  RAPPORTS_VIEW: [Role.ADMIN, Role.GESTIONNAIRE],

  // Journal Audit (PREMIUM)
  AUDIT_VIEW: [Role.ADMIN, Role.GESTIONNAIRE],

  // Users
  USERS_MANAGE: [Role.ADMIN],

  // Settings
  SETTINGS_MANAGE: [Role.ADMIN],
};

export function hasPermission(userRole: Role, permission: Role[]): boolean {
  return permission.includes(userRole);
}
