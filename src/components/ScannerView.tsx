import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scan, Package, Plus, Minus, History } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import ProductForm from './ProductForm';
import { ScanResult, Product } from '@/types/inventory';

interface ScannerViewProps {
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'lastUpdated'>) => Promise<Product>;
  onUpdateStock: (productId: string, quantity: number, type: 'add' | 'buy', price?: number) => void;
  getProduct: (barcode: string) => Product | undefined;
  recentScans: string[];
}

export default function ScannerView({ 
  onAddProduct, 
  onUpdateStock, 
  getProduct,
  recentScans = []
}: ScannerViewProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>(recentScans);

  const handleScan = (result: ScanResult) => {
    setCurrentBarcode(result.barcode);
    const existingProduct = getProduct(result.barcode);
    
    // Add to scan history
    setScanHistory(prev => {
      const newHistory = [result.barcode, ...prev.filter(b => b !== result.barcode)].slice(0, 10);
      return newHistory;
    });
    
    if (existingProduct) {
      setScannedProduct(existingProduct);
    } else {
      setScannedProduct(null);
    }
    
    setShowScanner(false);
    setShowProductForm(true);
  };

  const handleProductSubmit = async (productData: Omit<Product, 'id' | 'createdAt' | 'lastUpdated'>) => {
    await onAddProduct(productData);
    setShowProductForm(false);
    setCurrentBarcode('');
    setScannedProduct(null);
  };

  const handleProductFormClose = () => {
    setShowProductForm(false);
    setCurrentBarcode('');
    setScannedProduct(null);
  };

  const handleQuickScan = (barcode: string) => {
    handleScan({ barcode, format: 'manual' });
  };

  return (
    <div className="space-y-6">
      {/* Scanner Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Barcode Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Scan className="h-12 w-12 text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to Scan</h3>
              <p className="text-muted-foreground mb-4">
                Scan a barcode to add products or update inventory
              </p>
            </div>
            
            <Button 
              onClick={() => setShowScanner(true)} 
              size="lg"
              className="w-full max-w-xs"
            >
              <Scan className="h-5 w-5 mr-2" />
              Start Scanning
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowScanner(true)}>
          <CardContent className="p-6 text-center">
            <Plus className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Add New Product</h3>
            <p className="text-sm text-muted-foreground">
              Scan to add new items to inventory
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowScanner(true)}>
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">Update Stock</h3>
            <p className="text-sm text-muted-foreground">
              Scan to modify existing inventory
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowScanner(true)}>
          <CardContent className="p-6 text-center">
            <Minus className="h-8 w-8 mx-auto mb-3 text-orange-600" />
            <h3 className="font-semibold mb-2">Process Sale</h3>
            <p className="text-sm text-muted-foreground">
              Scan to record product sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.map((barcode, index) => {
                const product = getProduct(barcode);
                return (
                  <div 
                    key={`${barcode}-${index}`}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                    onClick={() => handleQuickScan(barcode)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {product ? product.name : `Product ${barcode.slice(-4)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {barcode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {product && (
                        <Badge variant={product.quantity <= product.minStock ? 'destructive' : 'default'}>
                          Stock: {product.quantity}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        Scan Again
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
      />

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          barcode={currentBarcode}
          existingProduct={scannedProduct}
          onSubmit={handleProductSubmit}
          onCancel={handleProductFormClose}
          onUpdateStock={onUpdateStock}
        />
      )}
    </div>
  );
}