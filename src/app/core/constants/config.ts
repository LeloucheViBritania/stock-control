export const APP_CONFIG = {
  appName: 'Gestion de Stock',
  appVersion: '1.0.0',
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
  currency: 'EUR',
  locale: 'fr-FR',
};

export const STORAGE_KEYS = {
  token: 'gestion_stock_token',
  refreshToken: 'gestion_stock_refresh_token',
  user: 'gestion_stock_user',
  theme: 'gestion_stock_theme',
  sidebar: 'gestion_stock_sidebar',
};
