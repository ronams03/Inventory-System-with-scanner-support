export interface Product {
  id: string;
  barcode: string;
  name: string;
  description: string;
  brand?: string;
  category: string;
  price: number;
  quantity: number;
  minStock: number;
  imageUrl?: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  productId: string;
  type: 'add' | 'buy' | 'sell' | 'adjust';
  quantity: number;
  price?: number;
  total?: number;
  timestamp: Date;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface ScanResult {
  barcode: string;
  format: string;
}