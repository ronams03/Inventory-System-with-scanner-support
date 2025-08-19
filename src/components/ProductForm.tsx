import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Plus, Minus } from 'lucide-react';
import { Product } from '@/types/inventory';
import { fetchProductInfo, validateBarcode } from '@/services/productApi';
import { toast } from 'sonner';

interface ProductFormProps {
  barcode: string;
  existingProduct?: Product | null;
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onCancel: () => void;
  onUpdateStock?: (productId: string, quantity: number, type: 'add' | 'buy', price?: number) => void;
}

export default function ProductForm({ 
  barcode, 
  existingProduct, 
  onSubmit, 
  onCancel,
  onUpdateStock 
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    price: '',
    quantity: '',
    minStock: '',
    imageUrl: ''
  });
  const [stockAction, setStockAction] = useState<'add' | 'buy'>('add');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockPrice, setStockPrice] = useState('');

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        description: existingProduct.description,
        brand: existingProduct.brand || '',
        category: existingProduct.category,
        price: existingProduct.price.toString(),
        quantity: existingProduct.quantity.toString(),
        minStock: existingProduct.minStock.toString(),
        imageUrl: existingProduct.imageUrl || ''
      });
    } else {
      fetchProductData();
    }
  }, [existingProduct, barcode]);

  const fetchProductData = async () => {
    if (!validateBarcode(barcode)) {
      toast.error('Invalid barcode format');
      return;
    }

    setLoading(true);
    try {
      const productInfo = await fetchProductInfo(barcode);
      if (productInfo) {
        setFormData(prev => ({
          ...prev,
          name: productInfo.name,
          description: productInfo.description,
          brand: productInfo.brand || '',
          category: productInfo.category,
          imageUrl: productInfo.imageUrl || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to fetch product information');
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    const productData = {
      barcode,
      name: formData.name.trim(),
      description: formData.description.trim(),
      brand: formData.brand.trim(),
      category: formData.category.trim() || 'Uncategorized',
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      minStock: parseInt(formData.minStock) || 5,
      imageUrl: formData.imageUrl.trim()
    };

    onSubmit(productData);
  };

  const handleStockUpdate = () => {
    if (!existingProduct || !onUpdateStock) return;
    
    const quantity = parseInt(stockQuantity);
    const price = parseFloat(stockPrice) || undefined;
    
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    onUpdateStock(existingProduct.id, quantity, stockAction, price);
    setStockQuantity('');
    setStockPrice('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-md my-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {existingProduct ? 'Update Product' : 'Add New Product'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{barcode}</Badge>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingProduct && (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{existingProduct.name}</h3>
                    <p className="text-sm text-muted-foreground">{existingProduct.brand}</p>
                  </div>
                  <Badge variant={existingProduct.quantity <= existingProduct.minStock ? 'destructive' : 'default'}>
                    Stock: {existingProduct.quantity}
                  </Badge>
                </div>
                <p className="text-sm">{existingProduct.description}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Price: ${existingProduct.price.toFixed(2)}</span>
                  <span>Min Stock: {existingProduct.minStock}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-medium">Stock Action</Label>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={stockAction === 'add' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStockAction('add')}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Stock
                  </Button>
                  <Button
                    type="button"
                    variant={stockAction === 'buy' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStockAction('buy')}
                    className="flex-1"
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Buy/Sell
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      min="1"
                    />
                  </div>
                  {stockAction === 'buy' && (
                    <div>
                      <Label>Price Each</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={stockPrice}
                        onChange={(e) => setStockPrice(e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleStockUpdate}
                  disabled={!stockQuantity || parseInt(stockQuantity) <= 0}
                  className="w-full"
                >
                  {stockAction === 'add' ? 'Add to Stock' : 'Process Sale'}
                </Button>
              </div>

              <Separator />
            </>
          )}

          {!existingProduct && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Brand name"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Category"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="0"
                    min="0"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Stock</Label>
                  <Input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                    placeholder="5"
                    min="0"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !formData.name.trim()} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Product
                </Button>
              </div>
            </form>
          )}

          {existingProduct && (
            <Button variant="outline" onClick={onCancel} className="w-full">
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}