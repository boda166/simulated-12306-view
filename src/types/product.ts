// Product type enum
export type ProductType = 'standard' | 'custom';

// Standardized Product interface for the entire application
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  images: string[];
  colors: string[];
  handle_types: string[];
  product_type: ProductType;
  in_stock: boolean;
  stock_quantity: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for creating new products (omits auto-generated fields)
export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  images: string[];
  colors: string[];
  handle_types: string[];
  product_type?: ProductType;
  in_stock?: boolean;
  stock_quantity?: number;
  featured?: boolean;
}

// Interface for updating products (all fields optional except id)
export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  original_price?: number;
  image_url?: string;
  images?: string[];
  colors?: string[];
  handle_types?: string[];
  product_type?: ProductType;
  in_stock?: boolean;
  stock_quantity?: number;
  featured?: boolean;
}

// Transformed product for display (matches legacy format for compatibility)
export interface ProductDisplay {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  categoryId: string;
  productType: ProductType;
  inStock: boolean;
  stockQuantity: number;
  colors: string[];
  handles: string[];
  handleTypes: string[];
  features: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  customizable?: boolean;
  featured?: boolean; // Added for admin compatibility
}

// Transform database product to display format
export const transformProduct = (dbProduct: any): ProductDisplay => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: Number(dbProduct.price),
  originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
  description: dbProduct.description || 'Handcrafted with premium beads and elegant finishing.',
  images: dbProduct.images?.length ? dbProduct.images : [dbProduct.image_url || '/src/assets/product-black-bag.jpg'],
  categoryId: 'handbag', // Default category for now
  productType: (dbProduct.product_type === 'custom' ? 'custom' : 'standard') as ProductType,
  inStock: dbProduct.in_stock,
  stockQuantity: dbProduct.stock_quantity || 0,
  colors: dbProduct.colors || [],
  handles: dbProduct.handle_types || [],
  handleTypes: dbProduct.handle_types || [],
  features: ['Handmade with premium beads', 'Customizable with your name', 'Choice of handle types', 'Elegant gift packaging'],
  isNew: false, // Can be calculated based on created_at
  isBestseller: dbProduct.featured || false,
  customizable: dbProduct.product_type === 'custom', // Only custom products are fully customizable
  featured: dbProduct.featured || false // Added for admin compatibility
});