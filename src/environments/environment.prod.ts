/**
 * Configuration de l'environnement de production
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.gestionstock.com/api',
  wsUrl: 'wss://api.gestionstock.com',
  
  auth: {
    tokenKey: 'gestion_stock_token',
    refreshTokenKey: 'gestion_stock_refresh_token',
    userKey: 'gestion_stock_user',
  },
  
  cache: {
    ttl: 10 * 60 * 1000,
  },
  
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  
  upload: {
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
  
  features: {
    analytics: true,
    debugMode: false,
  },
};
