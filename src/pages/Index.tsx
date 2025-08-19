import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import InventoryDashboard from '@/components/InventoryDashboard';
import ScannerView from '@/components/ScannerView';
import TransactionHistory from '@/components/TransactionHistory';
import { useInventory } from '@/hooks/useInventory';
import { Product } from '@/types/inventory';
import { Scan, Package, BarChart3 } from 'lucide-react';

export default function Index() {
  const [currentView, setCurrentView] = useState('dashboard');
  const {
    products,
    transactions,
    addProduct,
    updateStock,
    getProduct,
    getLowStockProducts,
    getRecentTransactions,
  } = useInventory();

  const lowStockProducts = getLowStockProducts();
  const recentTransactions = getRecentTransactions();

  const handleDeleteProduct = (productId: string) => {
    // In a real app, you would implement product deletion
    toast.info('Product deletion not implemented in demo');
  };

  const handleEditProduct = (product: Product) => {
    // In a real app, you would implement product editing
    toast.info('Product editing not implemented in demo');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'scanner':
        return (
          <ScannerView
            onAddProduct={addProduct}
            onUpdateStock={updateStock}
            getProduct={getProduct}
            recentScans={products.slice(-5).map(p => p.barcode)}
          />
        );
      case 'inventory':
        return (
          <InventoryDashboard
            products={products}
            transactions={recentTransactions}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'transactions':
        return (
          <TransactionHistory
            transactions={transactions}
            products={products}
          />
        );
      case 'alerts':
        return (
          <InventoryDashboard
            products={lowStockProducts}
            transactions={recentTransactions}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="text-center py-8">
              <h1 className="text-4xl font-bold mb-4">Inventory Management System</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Scan, track, and manage your inventory with ease
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setCurrentView('scanner')} 
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Scan className="h-5 w-5" />
                  Start Scanning
                </Button>
                <Button 
                  onClick={() => setCurrentView('inventory')} 
                  variant="outline" 
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  View Inventory
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-primary/10 rounded-lg p-6 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </div>
              
              <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">
                  ${products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-6 text-center">
                <Scan className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{transactions.length}</div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              
              <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-6 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
                <div className="text-sm text-muted-foreground">Low Stock</div>
              </div>
            </div>

            {/* Recent Activity */}
            {recentTransactions.length > 0 && (
              <InventoryDashboard
                products={products}
                transactions={recentTransactions}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        lowStockCount={lowStockProducts.length}
        totalProducts={products.length}
      />
      
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {renderCurrentView()}
      </main>
    </div>
  );
}