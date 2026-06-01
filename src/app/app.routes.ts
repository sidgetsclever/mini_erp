import { Routes } from '@angular/router';
import { OrderFormComponent } from './features/orders/order-form/order-form.component';
import { OrderUpdateComponent } from './features/orders/order-update/order-update.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'orders/new', component: OrderFormComponent },
  { path: 'orders/update/:id', component: OrderUpdateComponent }
];
