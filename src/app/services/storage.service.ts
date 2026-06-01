import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';

const STORAGE_KEY = 'erp_orders';

@Injectable({ providedIn: 'root' })
export class StorageService {

  load(): Order[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Order[]) : [];
    } catch {
      return [];
    }
  }

  save(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders, null, 2));
  }

  /** Returns the raw JSON string as it would appear in a file */
  exportJson(): string {
    return localStorage.getItem(STORAGE_KEY) ?? '[]';
  }
}
