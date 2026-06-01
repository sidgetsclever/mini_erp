import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly ordersService = inject(OrdersService);

  get orders() {
    return this.ordersService.orders();
  }

  get totalOrders() {
    return this.orders.length;
  }

  get newOrders() {
    return this.orders.filter(o => o.status === 'New').length;
  }

  get inProgressOrders() {
    return this.orders.filter(o => o.status === 'In Progress').length;
  }

  get doneOrders() {
    return this.orders.filter(o => o.status === 'Done').length;
  }

  doneItems(o: Order): number {
    return o.items.filter(i => i.status === 'Done').length;
  }
}
