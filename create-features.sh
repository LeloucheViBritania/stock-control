#!/bin/bash
cd /home/claude/gestion-stock-frontend

# Helper function to create placeholder component
create_placeholder() {
  local filepath=$1
  local componentName=$2
  local selector=$3
  local title=$4
  
  cat > "$filepath" << EOF
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: '${selector}',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: \`
    <div class="space-y-6">
      <div class="page-header">
        <h1 class="page-title">${title}</h1>
      </div>
      <div class="card card-body">
        <p class="text-gray-500 dark:text-gray-400">Cette page est en cours de développement.</p>
      </div>
    </div>
  \`,
})
export class ${componentName} {}
EOF
}

# ============ PRODUITS ============
create_placeholder "src/app/features/produits/pages/produits-list/produits-list.component.ts" "ProduitsListComponent" "app-produits-list" "Produits"
create_placeholder "src/app/features/produits/pages/produit-form/produit-form.component.ts" "ProduitFormComponent" "app-produit-form" "Formulaire Produit"
create_placeholder "src/app/features/produits/pages/produit-detail/produit-detail.component.ts" "ProduitDetailComponent" "app-produit-detail" "Détail Produit"
create_placeholder "src/app/features/produits/pages/stock-faible/stock-faible.component.ts" "StockFaibleComponent" "app-stock-faible" "Stock Faible"

# ============ CATEGORIES ============
create_placeholder "src/app/features/categories/pages/categories-list/categories-list.component.ts" "CategoriesListComponent" "app-categories-list" "Catégories"
create_placeholder "src/app/features/categories/pages/categorie-form/categorie-form.component.ts" "CategorieFormComponent" "app-categorie-form" "Formulaire Catégorie"

# ============ CLIENTS ============
create_placeholder "src/app/features/clients/pages/clients-list/clients-list.component.ts" "ClientsListComponent" "app-clients-list" "Clients"
create_placeholder "src/app/features/clients/pages/client-form/client-form.component.ts" "ClientFormComponent" "app-client-form" "Formulaire Client"
create_placeholder "src/app/features/clients/pages/client-detail/client-detail.component.ts" "ClientDetailComponent" "app-client-detail" "Détail Client"
create_placeholder "src/app/features/clients/pages/segmentation/segmentation.component.ts" "SegmentationComponent" "app-segmentation" "Segmentation Clients"

# ============ FOURNISSEURS ============
create_placeholder "src/app/features/fournisseurs/pages/fournisseurs-list/fournisseurs-list.component.ts" "FournisseursListComponent" "app-fournisseurs-list" "Fournisseurs"
create_placeholder "src/app/features/fournisseurs/pages/fournisseur-form/fournisseur-form.component.ts" "FournisseurFormComponent" "app-fournisseur-form" "Formulaire Fournisseur"
create_placeholder "src/app/features/fournisseurs/pages/fournisseur-detail/fournisseur-detail.component.ts" "FournisseurDetailComponent" "app-fournisseur-detail" "Détail Fournisseur"
create_placeholder "src/app/features/fournisseurs/pages/comparer-fournisseurs/comparer-fournisseurs.component.ts" "ComparerFournisseursComponent" "app-comparer-fournisseurs" "Comparer Fournisseurs"

# ============ COMMANDES ============
create_placeholder "src/app/features/commandes/pages/commandes-list/commandes-list.component.ts" "CommandesListComponent" "app-commandes-list" "Commandes"
create_placeholder "src/app/features/commandes/pages/commande-form/commande-form.component.ts" "CommandeFormComponent" "app-commande-form" "Formulaire Commande"
create_placeholder "src/app/features/commandes/pages/commande-detail/commande-detail.component.ts" "CommandeDetailComponent" "app-commande-detail" "Détail Commande"
create_placeholder "src/app/features/commandes/pages/commandes-export/commandes-export.component.ts" "CommandesExportComponent" "app-commandes-export" "Exporter Commandes"

# ============ MOUVEMENTS STOCK ============
create_placeholder "src/app/features/mouvements-stock/pages/mouvements-list/mouvements-list.component.ts" "MouvementsListComponent" "app-mouvements-list" "Mouvements de Stock"
create_placeholder "src/app/features/mouvements-stock/pages/mouvements-stats/mouvements-stats.component.ts" "MouvementsStatsComponent" "app-mouvements-stats" "Statistiques Mouvements"

# ============ ENTREPOTS ============
create_placeholder "src/app/features/entrepots/pages/entrepots-list/entrepots-list.component.ts" "EntrepotsListComponent" "app-entrepots-list" "Entrepôts"
create_placeholder "src/app/features/entrepots/pages/entrepot-form/entrepot-form.component.ts" "EntrepotFormComponent" "app-entrepot-form" "Formulaire Entrepôt"
create_placeholder "src/app/features/entrepots/pages/entrepot-detail/entrepot-detail.component.ts" "EntrepotDetailComponent" "app-entrepot-detail" "Détail Entrepôt"

# ============ TRANSFERTS STOCK ============
create_placeholder "src/app/features/transferts-stock/pages/transferts-list/transferts-list.component.ts" "TransfertsListComponent" "app-transferts-list" "Transferts de Stock"
create_placeholder "src/app/features/transferts-stock/pages/transfert-form/transfert-form.component.ts" "TransfertFormComponent" "app-transfert-form" "Formulaire Transfert"
create_placeholder "src/app/features/transferts-stock/pages/transfert-detail/transfert-detail.component.ts" "TransfertDetailComponent" "app-transfert-detail" "Détail Transfert"

# ============ INVENTAIRE ============
create_placeholder "src/app/features/inventaire/pages/inventaire-list/inventaire-list.component.ts" "InventaireListComponent" "app-inventaire-list" "Inventaires"
create_placeholder "src/app/features/inventaire/pages/inventaire-physique/inventaire-physique.component.ts" "InventairePhysiqueComponent" "app-inventaire-physique" "Inventaire Physique"
create_placeholder "src/app/features/inventaire/pages/session-comptage/session-comptage.component.ts" "SessionComptageComponent" "app-session-comptage" "Session de Comptage"

# ============ REAPPROVISIONNEMENT ============
create_placeholder "src/app/features/reapprovisionnement/pages/suggestions-list/suggestions-list.component.ts" "SuggestionsListComponent" "app-suggestions-list" "Réapprovisionnement"
create_placeholder "src/app/features/reapprovisionnement/pages/bon-commande-achat/bon-commande-achat.component.ts" "BonCommandeAchatComponent" "app-bon-commande-achat" "Bon de Commande"

# ============ PREVISIONS ============
create_placeholder "src/app/features/previsions/pages/previsions-dashboard/previsions-dashboard.component.ts" "PrevisionsDashboardComponent" "app-previsions-dashboard" "Prévisions"

# ============ RAPPORTS ============
create_placeholder "src/app/features/rapports/pages/rapports-home/rapports-home.component.ts" "RapportsHomeComponent" "app-rapports-home" "Rapports"
create_placeholder "src/app/features/rapports/pages/rapport-inventaire/rapport-inventaire.component.ts" "RapportInventaireComponent" "app-rapport-inventaire" "Rapport Inventaire"
create_placeholder "src/app/features/rapports/pages/rapport-ventes/rapport-ventes.component.ts" "RapportVentesComponent" "app-rapport-ventes" "Rapport Ventes"
create_placeholder "src/app/features/rapports/pages/rapport-mouvements/rapport-mouvements.component.ts" "RapportMouvementsComponent" "app-rapport-mouvements" "Rapport Mouvements"

# ============ JOURNAL AUDIT ============
create_placeholder "src/app/features/journal-audit/pages/audit-logs-list/audit-logs-list.component.ts" "AuditLogsListComponent" "app-audit-logs-list" "Journal d'Audit"
create_placeholder "src/app/features/journal-audit/pages/audit-stats/audit-stats.component.ts" "AuditStatsComponent" "app-audit-stats" "Statistiques Audit"

# ============ NOTIFICATIONS ============
create_placeholder "src/app/features/notifications/pages/notifications-center/notifications-center.component.ts" "NotificationsCenterComponent" "app-notifications-center" "Notifications"

# ============ SUBSCRIPTION ============
create_placeholder "src/app/features/subscription/pages/plans/plans.component.ts" "PlansComponent" "app-plans" "Abonnements"
create_placeholder "src/app/features/subscription/pages/checkout/checkout.component.ts" "CheckoutComponent" "app-checkout" "Paiement"
create_placeholder "src/app/features/subscription/pages/subscription-status/subscription-status.component.ts" "SubscriptionStatusComponent" "app-subscription-status" "Mon Abonnement"

# ============ SETTINGS ============
create_placeholder "src/app/features/settings/pages/profile/profile.component.ts" "ProfileComponent" "app-profile" "Mon Profil"
create_placeholder "src/app/features/settings/pages/security/security.component.ts" "SecurityComponent" "app-security" "Sécurité"
create_placeholder "src/app/features/settings/pages/preferences/preferences.component.ts" "PreferencesComponent" "app-preferences" "Préférences"
create_placeholder "src/app/features/settings/pages/users-management/users-management.component.ts" "UsersManagementComponent" "app-users-management" "Gestion Utilisateurs"

echo "Tous les composants de pages créés"
