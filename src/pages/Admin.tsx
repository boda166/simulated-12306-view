import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  TrendingUp 
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

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  items: any[];
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  categoryId: string;
  inStock: boolean;
  stockQuantity: number;
  colors: string[];
  handles: string[];
  features: string[];
}

const Admin = () => {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Redirect if not admin
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/auth" replace />;
  }

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, image_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch customer count
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
        createdAt: order.created_at
      })) || [];

      const transformedProducts = productsData?.map(product => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        description: product.description,
        images: product.images || (product.image_url ? [product.image_url] : []),
        categoryId: 'handbag',
        inStock: product.in_stock ?? true,
        stockQuantity: 10, // Default stock quantity
        colors: product.colors || [],
        handles: product.handle_types || [],
        features: []
      })) || [];

      setOrders(transformedOrders);
      setProducts(transformedProducts);
      
      // Calculate stats
      const totalSales = transformedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      setStats({
        totalSales,
        totalOrders: transformedOrders.length,
        totalProducts: transformedProducts.length,
        totalCustomers: customersCount || 0
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
      
      // Fallback to empty data
      setOrders([]);
      setProducts([]);
      setStats({ totalSales: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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

  const statsArray = [
    { 
      title: 'Total Sales', 
      value: `$${stats.totalSales.toLocaleString()}`, 
      icon: DollarSign, 
      trend: '+12%' 
    },
    { 
      title: 'Orders', 
      value: stats.totalOrders.toString(), 
      icon: ShoppingCart, 
      trend: '+8%' 
    },
    { 
      title: 'Products', 
      value: stats.totalProducts.toString(), 
      icon: Package, 
      trend: '+2%' 
    },
    { 
      title: 'Customers', 
      value: stats.totalCustomers.toString(), 
      icon: Users, 
      trend: '+15%' 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-playfair font-bold text-deep-rose mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your Luli Beads store</p>
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
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">{stat.trend}</span>
                  <span className="text-sm text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage and track customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No orders found</p>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">#{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                          <Badge className={`${getStatusColor(order.status)} border-0`}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage your product catalog</CardDescription>
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
                  {products.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No products found</p>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Stock: {product.stockQuantity}</p>
                          <p className="text-xs text-muted-foreground">Category: {product.categoryId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${product.price}</p>
                          <Badge variant={product.inStock ? 'default' : 'destructive'}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
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
              onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
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
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Admin;