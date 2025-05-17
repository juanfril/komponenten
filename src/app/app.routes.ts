import { Routes } from '@angular/router';

import { ProductDetailComponent } from './features/product/pages/product-detail/product-detail.component';
import { ProductFormComponent } from './features/product/pages/product-form/product-form.component';
import { ProductListComponent } from './features/product/pages/product-list/product-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'products/edit/:id', component: ProductFormComponent },
  { path: '**', redirectTo: '/products' },
];
