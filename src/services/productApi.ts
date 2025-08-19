import { toast } from 'sonner';

export interface ProductInfo {
  name: string;
  description: string;
  brand?: string;
  category: string;
  imageUrl?: string;
}

// Mock API service for product information lookup
// In a real application, you would integrate with services like:
// - Open Food Facts API
// - UPC Database
// - Barcode Lookup API
export async function fetchProductInfo(barcode: string): Promise<ProductInfo | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock product database based on barcode patterns
    const mockProducts: Record<string, ProductInfo> = {
      '123456789012': {
        name: 'Sample Energy Drink',
        description: 'Refreshing energy drink with natural ingredients',
        brand: 'EnergyMax',
        category: 'Beverages',
        imageUrl: 'https://via.placeholder.com/150x150?text=Energy+Drink'
      },
      '987654321098': {
        name: 'Organic Coffee Beans',
        description: 'Premium organic coffee beans, medium roast',
        brand: 'CoffeePro',
        category: 'Food & Beverages',
        imageUrl: 'https://via.placeholder.com/150x150?text=Coffee+Beans'
      },
      '456789123456': {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        brand: 'AudioTech',
        category: 'Electronics',
        imageUrl: 'https://via.placeholder.com/150x150?text=Headphones'
      }
    };

    // Check if we have mock data for this barcode
    if (mockProducts[barcode]) {
      return mockProducts[barcode];
    }

    // Generate generic product info based on barcode
    const categories = ['Electronics', 'Food & Beverages', 'Health & Beauty', 'Home & Garden', 'Clothing', 'Books'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    return {
      name: `Product ${barcode.slice(-4)}`,
      description: `Generic product with barcode ${barcode}`,
      category: randomCategory,
      imageUrl: `https://via.placeholder.com/150x150?text=Product+${barcode.slice(-4)}`
    };
  } catch (error) {
    console.error('Error fetching product info:', error);
    toast.error('Failed to fetch product information');
    return null;
  }
}

// Function to validate barcode format
export function validateBarcode(barcode: string): boolean {
  // Basic validation for common barcode formats
  const barcodeRegex = /^(\d{8}|\d{12}|\d{13}|\d{14})$/;
  return barcodeRegex.test(barcode);
}