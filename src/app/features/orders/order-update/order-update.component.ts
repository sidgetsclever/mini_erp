import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { Order, ItemStatus } from '../../../models/order.model';

@Component({
  selector: 'app-order-update',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-update.component.html',
  styleUrl: './order-update.component.scss'
})
export class OrderUpdateComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  orderId!: number;
  order = signal<Order | undefined>(undefined);

  readonly itemStatuses: ItemStatus[] = ['Pending', 'In Progress', 'Done', 'On Hold'];

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.order.set(this.ordersService.getById(this.orderId));
  }

  setItemStatus(itemId: number, event: Event) {
    const status = (event.target as HTMLSelectElement).value as ItemStatus;
    this.ordersService.updateItemStatus(this.orderId, itemId, status);
    this.order.set(this.ordersService.getById(this.orderId));
  }

  done() {
    this.router.navigate(['/dashboard']);
  }
}
