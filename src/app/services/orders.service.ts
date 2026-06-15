import { Injectable, signal } from '@angular/core';
import { Order, OrderItem, OrderStatus } from '../models/order.model';
import { StorageService } from './storage.service';

const FINAL_STATUSES = new Set<OrderItem['status']>(['M S A C', 'M S V C', 'M S V J', 'M S V S', 'M I A C', 'M I A J']);
const STARTED_STATUSES = new Set<OrderItem['status']>(['Party', ...FINAL_STATUSES]);

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly storage = new StorageService();
  private nextOrderId: number;
  private nextItemId: number;

  readonly orders = signal<Order[]>([]);

  constructor() {
    const saved = this.storage.load();
    this.orders.set(saved);
    this.nextOrderId = saved.length > 0 ? Math.max(...saved.map(o => o.id)) + 1 : 1;
    const allItems = saved.flatMap(o => o.items);
    this.nextItemId = allItems.length > 0 ? Math.max(...allItems.map(i => i.id)) + 1 : 1;
  }

  private persist(orders: Order[]) {
    this.orders.set(orders);
    this.storage.save(orders);
  }

  getById(id: number): Order | undefined {
    return this.orders().find(o => o.id === id);
  }

  addOrder(data: { jobNo?: string; customerName: string; contactEmail: string; notes: string; items: Omit<OrderItem, 'id'>[] }) {
    const items: OrderItem[] = data.items.map(item => ({ ...item, id: this.nextItemId++ }));
    const order: Order = {
      id: this.nextOrderId++,
      jobNo: data.jobNo,
      customerName: data.customerName,
      contactEmail: data.contactEmail,
      notes: data.notes,
      status: 'New',
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.persist([order, ...this.orders()]);
  }

  updateOrderStatus(orderId: number, status: OrderStatus) {
    const updated = this.orders().map(o =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    );
    this.persist(updated);
  }

  updateItemStatus(orderId: number, itemId: number, status: OrderItem['status']) {
    const updated = this.orders().map(o => {
      if (o.id !== orderId) return o;
      const items = o.items.map(i => i.id === itemId ? { ...i, status } : i);
      const allDone = items.length > 0 && items.every(i => FINAL_STATUSES.has(i.status));
      const anyInProgress = items.some(i => STARTED_STATUSES.has(i.status));
      let orderStatus: OrderStatus = 'New';
      if (allDone) { orderStatus = 'Done'; }
      else if (anyInProgress) { orderStatus = 'In Progress'; }
      return { ...o, items, status: orderStatus, updatedAt: new Date().toISOString() };
    });
    this.persist(updated);
  }

  addItemToOrder(orderId: number, item: Omit<OrderItem, 'id'>) {
    const newItem: OrderItem = { ...item, id: this.nextItemId++ };
    const updated = this.orders().map(o =>
      o.id === orderId ? { ...o, items: [...o.items, newItem], updatedAt: new Date().toISOString() } : o
    );
    this.persist(updated);
  }

  updateOrder(orderId: number, data: { customerName: string; contactEmail: string; notes: string }) {
    const updated = this.orders().map(o =>
      o.id === orderId ? { ...o, ...data, updatedAt: new Date().toISOString() } : o
    );
    this.persist(updated);
  }

  deleteOrder(orderId: number) {
    const updated = this.orders().filter(o => o.id !== orderId);
    this.persist(updated);
  }
}

