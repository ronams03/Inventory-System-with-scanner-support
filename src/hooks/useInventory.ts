import { useState, useCallback } from 'react';
import { Product, Transaction } from '@/types/inventory';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';

export function useInventory() {
  const [products, setProducts] = useLocalStorage<Product[]>('inventory_products', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('inventory_transactions', []);
  const [loading, setLoading] = useState(false);

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    setProducts(prev => [...prev, newProduct]);
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      productId: newProduct.id,
      type: 'add',
      quantity: productData.quantity,
      timestamp: new Date(),
      notes: 'Initial stock'
    };
    
    setTransactions(prev => [...prev, transaction]);
    toast.success(`Added ${productData.name} to inventory`);
    return newProduct;
  }, [setProducts, setTransactions]);

  const updateStock = useCallback((productId: string, quantity: number, type: 'add' | 'buy' | 'sell', price?: number) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const newQuantity = type === 'add' ? product.quantity + quantity : product.quantity - quantity;
        if (newQuantity < 0) {
          toast.error('Insufficient stock');
          return product;
        }
        
        const transaction: Transaction = {
          id: Date.now().toString(),
          productId,
          type,
          quantity,
          price,
          total: price ? price * quantity : undefined,
          timestamp: new Date(),
        };
        
        setTransactions(prev => [...prev, transaction]);
        
        if (type === 'buy') {
          toast.success(`Purchased ${quantity} ${product.name}`);
        } else if (type === 'sell') {
          toast.success(`Sold ${quantity} ${product.name}`);
        } else {
          toast.success(`Added ${quantity} ${product.name} to stock`);
        }
        
        return {
          ...product,
          quantity: newQuantity,
          lastUpdated: new Date(),
        };
      }
      return product;
    }));
  }, [setProducts, setTransactions]);

  const getProduct = useCallback((barcode: string) => {
    return products.find(p => p.barcode === barcode);
  }, [products]);

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => p.quantity <= p.minStock);
  }, [products]);

  const getRecentTransactions = useCallback((limit: number = 10) => {
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [transactions]);

  return {
    products,
    transactions,
    loading,
    addProduct,
    updateStock,
    getProduct,
    getLowStockProducts,
    getRecentTransactions,
  };
}