import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { ItemStatus } from '../../../models/order.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss'
})
export class OrderFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);

  readonly itemTypes = ['Print', 'Design', 'Finishing', 'Other'];
  readonly units = ['pcs', 'sheets', 'other'];
  readonly itemStatuses: ItemStatus[] = ['MO', 'Party', 'M S A C', 'M S V C', 'M S V J', 'M S V S', 'M I A C', 'M I A J'];

  form = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    contactEmail: ['', Validators.email],
    notes: [''],
    items: this.fb.array([this.newItemGroup()])
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  itemAt(i: number): FormGroup {
    return this.items.at(i) as FormGroup;
  }

  private newItemGroup(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      type: ['Print', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: ['pcs', Validators.required],
      notes: [''],
      sheets: [null],
      paper: [''],
      gsm: [''],
      size: [''],
      qty: [null],
      ctp: [''],
      sides: ['One Side'],
      lamination: [''],
      binding: ['Cutting'],
      productionPaper: [''],
      status: ['MO', Validators.required]
    });
  }

  addItem() {
    this.items.push(this.newItemGroup());
  }

  removeItem(i: number) {
    if (this.items.length > 1) this.items.removeAt(i);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.ordersService.addOrder({
      customerName: raw.customerName ?? '',
      contactEmail: raw.contactEmail ?? '',
      notes: raw.notes ?? '',
      items: (raw.items ?? []).map((item: any) => ({
        ...item,
        sheets: item.sheets ? Number(item.sheets) : null,
        qty: item.qty ? Number(item.qty) : null,
        status: item.status ?? 'MO'
      }))
    });
    this.router.navigate(['/dashboard']);
  }
}
