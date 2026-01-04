/**
 * Configuration de l'environnement de développement
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000',
  
  auth: {
    tokenKey: 'gestion_stock_token',
    refreshTokenKey: 'gestion_stock_refresh_token',
    userKey: 'gestion_stock_user',
  },
  
  cache: {
    ttl: 5 * 60 * 1000,
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
    analytics: false,
    debugMode: true,
  },
};
