// Standardized Cart interfaces for the entire application
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_color?: string;
  selected_handle?: string;
  custom_name?: string;
  created_at: string;
  updated_at: string;
}

// Cart item with enriched product data for display
export interface CartItemDisplay {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  selectedColor?: string;
  selectedHandle?: string;
  customName?: string;
  totalPrice: number;
}

// Input for adding items to cart
export interface AddCartItemInput {
  productId: string;
  quantity: number;
  selectedColor?: string;
  selectedHandle?: string;
  customName?: string;
}

// Input for updating cart items
export interface UpdateCartItemInput {
  id: string;
  quantity?: number;
  selectedColor?: string;
  selectedHandle?: string;
  customName?: string;
}

// Cart summary data
export interface CartSummary {
  items: CartItemDisplay[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
  isEmpty: boolean;
}

// Transform database cart item to display format
export const transformCartItem = (dbItem: any): CartItemDisplay => ({
  id: dbItem.id,
  productId: dbItem.product_id,
  productName: dbItem.products?.name || 'Unknown Product',
  productPrice: Number(dbItem.products?.price || 0),
  productImage: dbItem.products?.images?.[0] || dbItem.products?.image_url || '/src/assets/product-black-bag.jpg',
  quantity: dbItem.quantity,
  selectedColor: dbItem.selected_color,
  selectedHandle: dbItem.selected_handle,
  customName: dbItem.custom_name,
  totalPrice: Number(dbItem.products?.price || 0) * dbItem.quantity
});

// Calculate cart summary
export const calculateCartSummary = (items: CartItemDisplay[]): CartSummary => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
  const total = subtotal + shipping;

  return {
    items,
    totalItems,
    subtotal,
    shipping,
    total,
    isEmpty: items.length === 0
  };
};