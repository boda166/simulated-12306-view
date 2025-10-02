import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  TrendingUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import AdminProductForm from '@/components/AdminProductForm';
import AdminOrderDetails from '@/components/AdminOrderDetails';
import AdminCustomers from '@/components/AdminCustomers';
import AdminAnalytics from '@/components/AdminAnalytics';
import OrderManagement from '@/components/OrderManagement';
import AdminCustomOrders from '@/components/AdminCustomOrders';
import { StockManagementDialog } from '@/components/StockManagementDialog';
import { useProducts } from '@/hooks/useProducts';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: any[];
  createdAt: string;
  paymentMethod?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  images: string[];
  categoryId: string;
  inStock: boolean;
  stockQuantity: number;
  colors: string[];
  handles: string[];
  features: string[];
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
}

const Admin = () => {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stockManagementProduct, setStockManagementProduct] = useState<Product | null>(null);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const { updateProductStock } = useProducts();
  
  // Search and Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productStockFilter, setProductStockFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAdminData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      // Fetch orders with better error handling
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, image_url, images)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch products with stock information
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch customer count and recent registrations
      const { count: customersCount, error: customersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (customersError) throw customersError;

      const transformedOrders = ordersData?.map(order => ({
        id: order.id,
        customerName: `${(order.contact_info as any)?.firstName || ''} ${(order.contact_info as any)?.lastName || ''}`.trim() || 'Unknown Customer',
        customerEmail: (order.contact_info as any)?.email || 'No email',
        customerPhone: (order.contact_info as any)?.phone || 'No phone',
        shippingAddress: (order.shipping_address as any)?.address || 'No address',
        totalAmount: Number(order.total_amount),
        status: order.status as Order['status'],
        items: order.order_items || [],
        createdAt: order.created_at,
        paymentMethod: order.payment_method || 'Unknown'
      })) || [];

      const transformedProducts = productsData?.map(product => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        originalPrice: product.original_price ? Number(product.original_price) : undefined,
        description: product.description,
        images: product.images || (product.image_url ? [product.image_url] : []),
        categoryId: 'handbag',
        inStock: product.in_stock ?? true,
        stockQuantity: product.stock_quantity ?? 10,
        colors: product.colors || [],
        handles: product.handle_types || [],
        features: [],
        featured: product.featured ?? false,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      })) || [];

      setOrders(transformedOrders);
      setProducts(transformedProducts);
      setFilteredOrders(transformedOrders);
      setFilteredProducts(transformedProducts);
      
      // Calculate enhanced stats
      const totalSales = transformedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const thisMonthOrders = transformedOrders.filter(order => 
        new Date(order.createdAt).getMonth() === new Date().getMonth()
      );
      
      setStats({
        totalSales,
        totalOrders: transformedOrders.length,
        totalProducts: transformedProducts.length,
        totalCustomers: customersCount || 0,
        monthlyOrders: thisMonthOrders.length,
        monthlyRevenue: thisMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        lowStockProducts: transformedProducts.filter(p => p.stockQuantity < 5).length,
        pendingOrders: transformedOrders.filter(o => o.status === 'pending').length
      });

      if (showRefreshToast) {
        toast.success('Data refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
      
      // Fallback to empty data
      setOrders([]);
      setProducts([]);
      setFilteredOrders([]);
      setFilteredProducts([]);
      setStats({ 
        totalSales: 0, 
        totalOrders: 0, 
        totalProducts: 0, 
        totalCustomers: 0,
        monthlyOrders: 0,
        monthlyRevenue: 0,
        lowStockProducts: 0,
        pendingOrders: 0
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Filter effects
  useEffect(() => {
    let filtered = orders;
    
    if (orderSearch) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.id.toLowerCase().includes(orderSearch.toLowerCase())
      );
    }
    
    if (orderStatusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === orderStatusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, orderSearch, orderStatusFilter]);

  useEffect(() => {
    let filtered = products;
    
    if (productSearch) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.description?.toLowerCase().includes(productSearch.toLowerCase())
      );
    }
    
    if (productStockFilter !== 'all') {
      if (productStockFilter === 'in-stock') {
        filtered = filtered.filter(product => product.inStock);
      } else if (productStockFilter === 'out-of-stock') {
        filtered = filtered.filter(product => !product.inStock);
      } else if (productStockFilter === 'low-stock') {
        filtered = filtered.filter(product => product.stockQuantity < 5);
      }
    }
    
    setFilteredProducts(filtered);
  }, [products, productSearch, productStockFilter]);

  // Redirect if not admin - after all hooks are called
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/auth" replace />;
  }

  const handleCreateProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          price: productData.price,
          description: productData.description,
          images: productData.images,
          colors: productData.colors,
          handle_types: productData.handles,
          in_stock: productData.inStock,
          featured: false
        });

      if (error) throw error;

      toast.success('Product created successfully');
      setShowProductForm(false);
      fetchAdminData();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const handleUpdateProduct = async (productData: Omit<Product, 'id'>) => {
    if (!editingProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          price: productData.price,
          description: productData.description,
          images: productData.images,
          colors: productData.colors,
          handle_types: productData.handles,
          in_stock: productData.inStock
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast.success('Product updated successfully');
      setEditingProduct(null);
      setShowProductForm(false);
      fetchAdminData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleSaveProduct = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    fetchAdminData();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Product deleted successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateStock = async (productId: string, stockData: { stock_quantity: number; in_stock: boolean }) => {
    try {
      await updateProductStock(productId, stockData);
      fetchAdminData();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleUpdateShipping = async (orderId: string, shippingData: {
    tracking_number?: string;
    carrier?: string;
    shipping_status?: string;
  }) => {
    try {
      const updateData: any = { ...shippingData };
      
      // Auto-set timestamps based on status
      if (shippingData.shipping_status === 'shipped' && !updateData.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      }
      if (shippingData.shipping_status === 'delivered' && !updateData.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Shipping information updated successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error updating shipping info:', error);
      toast.error('Failed to update shipping information');
    }
  };

  const statsArray = [
    { 
      title: 'Total Sales', 
      value: `$${stats.totalSales.toLocaleString()}`, 
      icon: DollarSign, 
      trend: `$${stats.monthlyRevenue.toLocaleString()} this month`,
      trendColor: 'text-green-600'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders.toString(), 
      icon: ShoppingCart, 
      trend: `${stats.monthlyOrders} this month`,
      trendColor: 'text-blue-600'
    },
    { 
      title: 'Products', 
      value: stats.totalProducts.toString(), 
      icon: Package, 
      trend: `${stats.lowStockProducts} low stock`,
      trendColor: stats.lowStockProducts > 0 ? 'text-orange-600' : 'text-green-600'
    },
    { 
      title: 'Customers', 
      value: stats.totalCustomers.toString(), 
      icon: Users, 
      trend: `${stats.pendingOrders} pending orders`,
      trendColor: stats.pendingOrders > 0 ? 'text-red-600' : 'text-green-600'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'processing': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return RefreshCw;
      case 'shipped': return Package;
      case 'delivered': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-deep-rose mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your Luli Beads store</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchAdminData(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsArray.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-rose-gold" />
                </div>
                  <div className="flex items-center mt-4">
                  <span className={`text-sm ${stat.trendColor}`}>{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders ({filteredOrders.length})</TabsTrigger>
            <TabsTrigger value="products">Products ({filteredProducts.length})</TabsTrigger>
            <TabsTrigger value="custom-orders">Custom Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="hero" 
                    className="w-full justify-start"
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('orders')}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View Pending Orders ({stats.pendingOrders})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('products')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Check Low Stock ({stats.lowStockProducts})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('customers')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Customers
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p>New order from {order.customerName}</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Product Management
                    <Badge variant="secondary">{filteredProducts.length} products</Badge>
                  </CardTitle>
                  <CardDescription>Manage your product catalog</CardDescription>
                  
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name or description..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={productStockFilter} onValueChange={setProductStockFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Filter by stock" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  variant="hero"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {productSearch || productStockFilter !== 'all' ? 'No products match your filters' : 'No products found'}
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                       <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                         <div className="flex items-center gap-4">
                           <div className="relative">
                             <img
                               src={product.images[0] || '/placeholder.svg'}
                               alt={product.name}
                               className="w-16 h-16 object-cover rounded-lg"
                             />
                             {product.featured && (
                               <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                               </div>
                             )}
                           </div>
                           <div className="space-y-1">
                             <div className="flex items-center gap-2">
                               <p className="font-medium">{product.name}</p>
                               {product.featured && (
                                 <Badge variant="secondary" className="text-xs">Featured</Badge>
                               )}
                             </div>
                             <p className="text-sm text-muted-foreground">
                               Colors: {product.colors.length > 0 ? product.colors.slice(0, 3).join(', ') : 'N/A'}
                               {product.colors.length > 3 && ` +${product.colors.length - 3} more`}
                             </p>
                             <p className="text-xs text-muted-foreground">
                               Handles: {product.handles.length > 0 ? product.handles.slice(0, 2).join(', ') : 'N/A'}
                               {product.handles.length > 2 && ` +${product.handles.length - 2} more`}
                             </p>
                             <p className="text-xs text-muted-foreground">
                               Stock: {product.stockQuantity} units
                             </p>
                           </div>
                         </div>
                         <div className="text-right space-y-1">
                           <div className="flex items-center gap-2">
                             <p className="font-medium">${product.price.toFixed(2)}</p>
                             {product.originalPrice && product.originalPrice > product.price && (
                               <p className="text-sm text-muted-foreground line-through">
                                 ${product.originalPrice.toFixed(2)}
                               </p>
                             )}
                           </div>
                          <Badge variant={
                            !product.inStock ? 'destructive' : 
                            product.stockQuantity < 5 ? 'secondary' : 
                            'default'
                          }>
                            {!product.inStock ? 'Out of Stock' : 
                             product.stockQuantity < 5 ? `Low Stock (${product.stockQuantity})` : 
                             'In Stock'}
                          </Badge>
                           <p className="text-xs text-muted-foreground">
                             Created: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown'}
                           </p>
                        </div>
                         <div className="flex gap-2">
                           <Button 
                             variant="outline" 
                             size="icon"
                             onClick={() => {
                               setStockManagementProduct(product);
                               setShowStockDialog(true);
                             }}
                             title="Manage Stock"
                           >
                             <BarChart3 className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="outline" 
                             size="icon"
                             onClick={() => {
                               setEditingProduct(product);
                               setShowProductForm(true);
                             }}
                             title="Edit Product"
                           >
                             <Edit className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="outline" 
                             size="icon"
                             onClick={() => handleDeleteProduct(product.id)}
                             title="Delete Product"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-orders">
            <AdminCustomOrders />
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View and manage customer information</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminCustomers />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>Track your store performance</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Admin Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <AdminProductForm
              product={editingProduct as any}
              onSave={handleSaveProduct}
              onCancel={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        )}

        {/* Admin Order Details Modal */}
        {selectedOrder && (
          <AdminOrderDetails
            order={selectedOrder as any}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdateShipping={handleUpdateShipping}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        {/* Stock Management Dialog */}
        <StockManagementDialog
          product={stockManagementProduct ? {
            id: stockManagementProduct.id,
            name: stockManagementProduct.name,
            stock_quantity: stockManagementProduct.stockQuantity,
            in_stock: stockManagementProduct.inStock
          } : null}
          open={showStockDialog}
          onOpenChange={setShowStockDialog}
          onUpdate={handleUpdateStock}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Admin;