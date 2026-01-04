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
