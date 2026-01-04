# 📦 Gestion de Stock - Frontend Angular

Application frontend Angular pour la gestion de stock avec système d'abonnement FREE/PREMIUM.

![Angular](https://img.shields.io/badge/Angular-18-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 Fonctionnalités

### 🆓 Fonctionnalités FREE
- ✅ Gestion des produits, catégories, clients et fournisseurs
- ✅ Commandes et mouvements de stock basiques
- ✅ Dashboard et alertes de stock
- ✅ Notifications en temps réel

### 🔒 Fonctionnalités PREMIUM
- 🏢 Multi-entrepôts et gestion des transferts
- 📊 Rapports avancés et exports (PDF, Excel, CSV)
- 📝 Journal d'audit complet
- 📈 Prévisions et réapprovisionnement automatique
- 🔍 Inventaire physique avec sessions de comptage

## 📋 Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Angular CLI** >= 18.0.0

## 🛠️ Installation

```bash
# Cloner le repository
git clone https://github.com/votre-repo/gestion-stock-frontend.git

# Accéder au dossier
cd gestion-stock-frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

## 🏃 Démarrage

```bash
# Mode développement
npm start

# Mode production
npm run build:prod
```

L'application sera accessible sur `http://localhost:4200`

## 📁 Structure du projet

```
src/
├── app/
│   ├── core/           # Services, guards, interceptors, models
│   ├── shared/         # Composants, directives, pipes réutilisables
│   └── features/       # Modules de fonctionnalités
│       ├── auth/
│       ├── dashboard/
│       ├── produits/
│       ├── categories/
│       ├── clients/
│       ├── fournisseurs/
│       ├── commandes/
│       ├── mouvements-stock/
│       ├── entrepots/        [PREMIUM]
│       ├── transferts-stock/ [PREMIUM]
│       ├── inventaire/       [PREMIUM]
│       ├── journal-audit/    [PREMIUM]
│       └── rapports/         [PREMIUM]
├── assets/
├── environments/
└── styles.scss
```

## 🔑 Comptes de test

| Rôle | Utilisateur | Mot de passe | Tier |
|------|-------------|--------------|------|
| Admin | admin | admin123 | PREMIUM |
| Gestionnaire | gestionnaire | gestionnaire123 | FREE |
| Employé | employe | employe123 | FREE |

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:ci

# Tests e2e
npm run e2e
```

## 📦 Build

```bash
# Build de production
npm run build:prod

# Analyser la taille du bundle
npm run analyze
```

## 🎨 Design System

L'application utilise **TailwindCSS** avec un design system personnalisé :

### Couleurs principales
- `primary` - Bleu (#3B82F6)
- `success` - Vert (#10B981)
- `warning` - Orange (#F59E0B)
- `danger` - Rouge (#EF4444)
- `premium` - Or (#F59E0B)

### États de stock
- `stock-critical` - Rouge
- `stock-low` - Orange
- `stock-normal` - Vert
- `stock-high` - Bleu

## 🔌 API Backend

Cette application se connecte à l'API NestJS de gestion de stock.

**URL par défaut**: `http://localhost:3000/api`

Documentation Swagger: `http://localhost:3000/api/docs`

## 📝 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm start` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm test` | Lance les tests unitaires |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run format` | Formate le code avec Prettier |

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

- 📧 Email: support@gestionstock.com
- 📚 Documentation: https://docs.gestionstock.com
- 🐛 Issues: https://github.com/votre-repo/issues

---

Développé avec ❤️ par Votre Entreprise
