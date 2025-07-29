import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Header from '@/components/Header';
import { adminAPI, ordersAPI, productsAPI, Product, Order } from '@/lib/api';

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [statsData, setStatsData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, productsData, stats] = await Promise.all([
        ordersAPI.getAll(),
        productsAPI.getAll(),
        adminAPI.getStats()
      ]);
      
      setOrders(ordersData);
      setProducts(productsData);
      setStatsData(stats);
    } catch (error) {
      toast.error('Failed to load admin data');
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { 
      title: 'Total Sales', 
      value: `$${statsData.totalSales.toLocaleString()}`, 
      icon: DollarSign, 
      trend: '+12%' 
    },
    { 
      title: 'Orders', 
      value: statsData.totalOrders.toString(), 
      icon: ShoppingCart, 
      trend: '+8%' 
    },
    { 
      title: 'Products', 
      value: statsData.totalProducts.toString(), 
      icon: Package, 
      trend: '+2%' 
    },
    { 
      title: 'Customers', 
      value: statsData.totalCustomers.toString(), 
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

  if (isLoading) {
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
          {stats.map((stat) => (
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
                          <Button variant="outline" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Edit className="w-4 h-4" />
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
                <Button variant="hero">Add Product</Button>
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
                          <Button variant="outline" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon">
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
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Customer management features coming soon</p>
                </div>
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
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;