export type ItemType = 'Print' | 'Design' | 'Finishing' | 'Other';
export type ItemStatus = 'Pending' | 'In Progress' | 'Done' | 'On Hold';
export type OrderStatus = 'New' | 'In Progress' | 'Done';

export interface OrderItem {
  id: number;
  description: string;
  type: ItemType;
  quantity: number;
  unit: string;
  status: ItemStatus;
  notes: string;
}

export interface Order {
  id: number;
  customerName: string;
  contactEmail: string;
  notes: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
