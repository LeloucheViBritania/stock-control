# Stock Control Frontend

Application Angular 18 pour la gestion de stock avec système SaaS (GRATUIT/PREMIUM).

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install --legacy-peer-deps

# Lancer en développement
npm start

# Build production
npm run build
```

L'application sera accessible sur `http://localhost:4200`

## 🔐 Comptes de test

| Rôle | Identifiant | Mot de passe | Tier |
|------|-------------|--------------|------|
| Admin | admin | admin123 | PREMIUM |
| Gestionnaire | gestionnaire | gestionnaire123 | GRATUIT |
| Employé | employe | employe123 | GRATUIT |

## 📁 Structure du projet

```
src/app/
├── core/
│   ├── guards/          # Auth, Premium, Role guards
│   ├── interceptors/    # Auth, Error, Loading
│   ├── models/          # 40+ interfaces TypeScript
│   └── services/        # 17 services API
├── shared/
│   └── components/      # Toast, Pagination, ConfirmModal
├── features/
│   ├── auth/            # Login, Register, ForgotPassword, Profil
│   ├── dashboard/       # KPIs et statistiques
│   ├── produits/        # CRUD produits
│   ├── categories/      # CRUD catégories
│   ├── clients/         # CRUD clients
│   ├── fournisseurs/    # CRUD fournisseurs
│   ├── commandes/       # Gestion commandes
│   ├── mouvements-stock/# Historique mouvements
│   ├── subscription/    # Toggle Premium (activation/désactivation)
│   ├── entrepots/       # [PREMIUM] Multi-entrepôts
│   ├── inventaire/      # [PREMIUM] Stock par entrepôt
│   ├── inventaire-physique/ # [PREMIUM] Sessions comptage
│   ├── transferts-stock/# [PREMIUM] Transferts inter-entrepôts
│   ├── previsions/      # [PREMIUM] Prévisions demande
│   ├── reapprovisionnement/ # [PREMIUM] Suggestions réappro
│   ├── rapports/        # [PREMIUM] Génération rapports PDF
│   ├── journal-audit/   # [PREMIUM] Logs activité
│   └── utilisateurs/    # [ADMIN] Gestion utilisateurs
└── layouts/
    └── main-layout/     # Sidebar, Header, Navigation
```

## 🎯 Fonctionnalités

### Modules GRATUITS
- ✅ **Produits** - CRUD complet avec gestion stock
- ✅ **Catégories** - Organisation hiérarchique
- ✅ **Clients** - Gestion clientèle avec segments
- ✅ **Fournisseurs** - Gestion fournisseurs avec évaluations
- ✅ **Commandes** - Workflow complet (création → livraison)
- ✅ **Mouvements Stock** - Historique entrées/sorties
- ✅ **Dashboard** - KPIs temps réel

### Modules PREMIUM
- ⭐ **Entrepôts** - Gestion multi-sites
- ⭐ **Inventaire** - Stock par emplacement
- ⭐ **Inventaire Physique** - Sessions de comptage
- ⭐ **Transferts Stock** - Mouvements inter-entrepôts
- ⭐ **Prévisions** - Analyse prédictive demande
- ⭐ **Réapprovisionnement** - Suggestions automatiques
- ⭐ **Rapports** - Génération PDF/Excel
- ⭐ **Journal Audit** - Traçabilité complète

### Module ADMIN
- 🔒 **Utilisateurs** - Gestion comptes et rôles

## 🔧 Configuration

### Environnement
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### API Backend
Le frontend communique avec l'API NestJS sur le port 3000.
Assurez-vous que le backend est démarré avant de lancer le frontend.

## 🎨 Design System

- **Framework CSS** : SCSS personnalisé avec variables CSS
- **Icônes** : Phosphor Icons
- **Typographie** : DM Sans, Space Grotesk, JetBrains Mono
- **Couleurs** : Palette primary/success/warning/error/info
- **Composants** : Cards, Tables, Forms, Modals, Badges, Buttons

## 📊 Fonctionnalités techniques

- **Angular 18** avec standalone components
- **Signals** pour la gestion d'état réactif
- **Lazy loading** des modules
- **Guards** pour protection des routes
- **Interceptors** pour auth et gestion erreurs
- **RxJS** pour les flux asynchrones
- **Chart.js** prêt pour les graphiques

## 🔒 Sécurité

- JWT stocké en localStorage
- Auto-refresh du token
- Protection des routes par rôle
- Protection des modules Premium
- Interceptor d'erreurs global

## 📱 Responsive

- Desktop : Sidebar complète
- Tablet : Sidebar collapsible
- Mobile : Sidebar overlay

## 🛠️ Scripts disponibles

```bash
npm start       # Démarre le serveur de dev
npm run build   # Build production
npm run watch   # Build avec watch
npm test        # Lance les tests
```

## 📝 Notes

- Le système Premium est un simple toggle (activation/désactivation)
- Pas de système de paiement implémenté
- Les données de test sont gérées par le backend
- WebSocket prêt pour les notifications temps réel

## 🔗 Liens

- **API Backend** : http://localhost:3000/api
- **Documentation API** : http://localhost:3000/api/docs (Swagger)
