const API_BASE_URL = 'https://lullibag.runasp.net/api';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  categoryId: string;
  inStock: boolean;
  stockQuantity: number;
  colors: string[];
  handles: string[];
  features: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  customName?: string;
  selectedColor?: string;
  selectedHandle?: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Create headers with auth token
const createHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...createHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    
    setAuthToken(response.token);
    return response;
  },

  register: async (userData: { email: string; password: string; name: string }): Promise<{ token: string; user: User }> => {
    const response = await apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(userData),
    });
    
    setAuthToken(response.token);
    return response;
  },

  logout: (): void => {
    removeAuthToken();
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/users/me');
  },
};

// Products API
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    return apiRequest<Product[]>('/products');
  },

  getById: async (id: string): Promise<Product> => {
    return apiRequest<Product>(`/products/${id}`);
  },

  create: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    return apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  update: async (id: string, productData: Partial<Product>): Promise<Product> => {
    return apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cart API
export const cartAPI = {
  get: async (): Promise<CartItem[]> => {
    return apiRequest<CartItem[]>('/cart');
  },

  addItem: async (item: CartItem): Promise<void> => {
    return apiRequest<void>('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateItem: async (productId: string, quantity: number): Promise<void> => {
    return apiRequest<void>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (productId: string): Promise<void> => {
    return apiRequest<void>(`/cart/${productId}`, {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    return apiRequest<Order[]>('/orders');
  },

  create: async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    return apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    return apiRequest<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Admin API
export const adminAPI = {
  getStats: async (): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  }> => {
    return apiRequest<{
      totalSales: number;
      totalOrders: number;
      totalProducts: number;
      totalCustomers: number;
    }>('/admindashboard/stats');
  },

  getUsers: async (): Promise<User[]> => {
    return apiRequest<User[]>('/users');
  },
};

// Coupons API
export const couponsAPI = {
  apply: async (code: string): Promise<{ discount: number; message: string }> => {
    return apiRequest<{ discount: number; message: string }>(`/coupons/apply/${code}`, {
      method: 'POST',
    });
  },
};

// Export utility functions
export { getAuthToken, setAuthToken, removeAuthToken };