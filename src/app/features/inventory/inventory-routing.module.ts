const routes: Routes = [
  { path: '', component: ProductListComponent }, // Page par défaut
  { path: 'new', component: ProductFormComponent },
  { path: 'edit/:id', component: ProductFormComponent }
];