import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { Order, OrderStatus, ItemStatus } from '../../models/order.model';
import * as XLSX from 'xlsx';

type DashboardStatusFilter = 'All' | OrderStatus;
const COMPLETED_ITEM_STATUSES = new Set<ItemStatus>(['M S A C', 'M S V C', 'M S V J', 'M S V S', 'M I A C', 'M I A J']);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly ordersService = inject(OrdersService);
  readonly statusFilter = signal<DashboardStatusFilter>('All');
  readonly itemStatusFilter = signal<'All' | ItemStatus>('All');
  readonly searchFilter = signal('');
  readonly importMessage = signal('');
  readonly productionStatuses: ItemStatus[] = ['MO', 'Party', 'M S A C', 'M S V C', 'M S V J', 'M S V S', 'M I A C', 'M I A J'];
  private readonly productionStatusSet = new Set<ItemStatus>(this.productionStatuses);

  get orders() {
    return this.ordersService.orders();
  }

  get filteredOrders() {
    const status = this.statusFilter();
    const itemStatus = this.itemStatusFilter();
    const query = this.searchFilter().trim().toLowerCase();

    return this.orders.filter((order) => {
      const matchesStatus = status === 'All' || order.status === status;
      const matchesItemStatus =
        itemStatus === 'All' || order.items.some((item) => item.status === itemStatus);
      const matchesQuery =
        !query ||
        order.customerName.toLowerCase().includes(query) ||
        order.items.some((item) =>
          item.description.toLowerCase().includes(query) ||
          item.paper.toLowerCase().includes(query) ||
          item.gsm.toLowerCase().includes(query) ||
          item.size.toLowerCase().includes(query)
        ) ||
        (order.contactEmail ?? '').toLowerCase().includes(query) ||
        String(order.id).includes(query);

      return matchesStatus && matchesItemStatus && matchesQuery;
    });
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

  completedItems(o: Order): number {
    return o.items.filter(i => COMPLETED_ITEM_STATUSES.has(i.status)).length;
  }

  setStatusFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value as DashboardStatusFilter;
    this.statusFilter.set(value);
  }

  setSearchFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchFilter.set(value);
  }

  setItemStatusFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value as 'All' | ItemStatus;
    this.itemStatusFilter.set(value);
  }

  deleteOrder(orderId: number) {
    const confirmed = confirm(`Delete order ${orderId}? This cannot be undone.`);
    if (!confirmed) return;
    this.ordersService.deleteOrder(orderId);
  }

  async importExcel(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });

      let imported = 0;

      for (const row of rows) {
        const c1 = String(row[0] ?? '').trim();
        const c2 = String(row[1] ?? '').trim();
        if (c1 === 'Job No.' || c2 === 'Client Name') continue;
        if (!c1 || !c2) continue;
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(c1)) continue;

        const stageRaw = String(row[13] ?? '').trim();
        const stage: ItemStatus = this.productionStatusSet.has(stageRaw as ItemStatus)
          ? (stageRaw as ItemStatus)
          : 'MO';

        const sheets = this.toNullableNumber(row[3]);
        const qty = this.toNullableNumber(row[7]);
        const ctpRaw = String(row[8] ?? '').trim();
        const ctpNumber = this.toNullableNumber(ctpRaw);

        this.ordersService.addOrder({
          jobNo: c1,
          customerName: c2,
          contactEmail: '',
          notes: '',
          items: [
            {
              description: String(row[2] ?? '').trim(),
              type: 'Print',
              quantity: qty ?? 1,
              unit: 'pcs',
              status: stage,
              notes: '',
              sheets,
              paper: String(row[4] ?? '').trim(),
              gsm: String(row[5] ?? '').trim(),
              size: String(row[6] ?? '').trim(),
              qty,
              ctp: ctpNumber === null ? ctpRaw : String(ctpNumber),
              sides: String(row[9] ?? '').trim(),
              lamination: String(row[10] ?? '').trim(),
              binding: String(row[11] ?? '').trim(),
              productionPaper: String(row[12] ?? '').trim()
            }
          ]
        });

        imported++;
      }

      this.importMessage.set(imported > 0 ? `Imported ${imported} rows from ${file.name}` : `No valid data rows found in ${file.name}`);
    } catch {
      this.importMessage.set('Failed to import Excel file. Please use the June format sheet.');
    } finally {
      input.value = '';
    }
  }

  private toNullableNumber(value: unknown): number | null {
    let normalized = '';
    if (typeof value === 'number') {
      normalized = String(value);
    } else if (typeof value === 'string') {
      normalized = value;
    }
    const parsed = Number(normalized.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
}
