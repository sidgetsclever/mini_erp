export type ItemType = 'Print' | 'Design' | 'Finishing' | 'Other';
export type ItemStatus =
  | 'MO'
  | 'Party'
  | 'M S A C'
  | 'M S V C'
  | 'M S V J'
  | 'M S V S'
  | 'M I A C'
  | 'M I A J';
export type OrderStatus = 'New' | 'In Progress' | 'Done';

export interface OrderItem {
  id: number;
  description: string;
  type: ItemType;
  quantity: number;
  unit: string;
  status: ItemStatus;
  notes: string;
  sheets: number | null;
  paper: string;
  gsm: string;
  size: string;
  qty: number | null;
  ctp: string;
  sides: string;
  lamination: string;
  binding: string;
  productionPaper: string;
}

export interface Order {
  id: number;
  jobNo?: string;
  customerName: string;
  contactEmail: string;
  notes: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
