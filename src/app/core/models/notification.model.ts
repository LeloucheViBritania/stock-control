export interface Notification {
  id: string;
  type: 'ALERTE_STOCK' | 'COMMANDE' | 'SYSTEME' | 'INFO';
  titre: string;
  message: string;
  lien?: string;
  isRead: boolean;
  userId: string;
  createdAt: Date;
}
