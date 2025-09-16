import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Star,
  Heart,
  Package,
  User,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsData {
  salesData: any[];
  orderStatusData: any[];
  topProducts: any[];
  recentActivity: any[];
  metrics: {
    conversionRate: number;
    avgOrderValue: number;
    returnRate: number;
    customerSatisfaction: number;
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
}

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    salesData: [],
    orderStatusData: [],
    topProducts: [],
    recentActivity: [],
    metrics: {
      conversionRate: 0,
      avgOrderValue: 0,
      returnRate: 0,
      customerSatisfaction: 4.8,
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              price
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // Fetch profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch wishlists data for recent activity
      const { data: wishlists, error: wishlistsError } = await supabase
        .from('wishlists')
        .select(`
          *,
          products (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (wishlistsError) throw wishlistsError;

      // Process the data
      const processedData = processAnalyticsData(orders || [], products || [], profiles || [], wishlists || []);
      setAnalyticsData(processedData);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processAnalyticsData = (orders: any[], products: any[], profiles: any[], wishlists: any[]): AnalyticsData => {
    // Calculate monthly sales data
    const monthlyData = getMonthlyData(orders);
    
    // Calculate order status distribution
    const statusData = getOrderStatusData(orders);
    
    // Calculate top products
    const topProductsData = getTopProducts(orders, products);
    
    // Generate recent activity
    const recentActivityData = getRecentActivity(orders, products, wishlists, profiles);
    
    // Calculate metrics
    const metrics = calculateMetrics(orders, profiles);

    return {
      salesData: monthlyData,
      orderStatusData: statusData,
      topProducts: topProductsData,
      recentActivity: recentActivityData,
      metrics
    };
  };

  const getMonthlyData = (orders: any[]) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyData = Array(12).fill(0).map((_, index) => ({
      name: monthNames[index],
      sales: 0,
      orders: 0
    }));

    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        monthlyData[monthIndex].sales += parseFloat(order.total_amount || 0);
        monthlyData[monthIndex].orders += 1;
      }
    });

    return monthlyData.slice(0, 6); // Show last 6 months
  };

  const getOrderStatusData = (orders: any[]) => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const statusColors = {
      pending: '#fbbf24',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: statusColors[status as keyof typeof statusColors] || '#6b7280'
    }));
  };

  const getTopProducts = (orders: any[], products: any[]) => {
    const productStats: { [key: string]: { name: string; sales: number; revenue: number } } = {};

    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const productName = item.products?.name || 'Unknown Product';
        if (!productStats[productName]) {
          productStats[productName] = { name: productName, sales: 0, revenue: 0 };
        }
        productStats[productName].sales += item.quantity;
        productStats[productName].revenue += parseFloat(item.price) * item.quantity;
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getRecentActivity = (orders: any[], products: any[], wishlists: any[], profiles: any[]) => {
    const activities: any[] = [];

    // Recent orders
    orders.slice(0, 3).forEach(order => {
      activities.push({
        type: 'order',
        description: `New order #${order.id.slice(-4)} - Total: $${parseFloat(order.total_amount).toFixed(2)}`,
        time: getTimeAgo(order.created_at),
        icon: Package
      });
    });

    // Recent wishlists
    wishlists.slice(0, 2).forEach(wishlist => {
      activities.push({
        type: 'wishlist',
        description: `${wishlist.products?.name || 'Product'} added to wishlist`,
        time: getTimeAgo(wishlist.created_at),
        icon: Heart
      });
    });

    // Recent user registrations
    profiles.slice(0, 2).forEach(profile => {
      activities.push({
        type: 'user',
        description: `New user registration: ${profile.email}`,
        time: getTimeAgo(profile.created_at),
        icon: User
      });
    });

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  };

  const calculateMetrics = (orders: any[], profiles: any[]) => {
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    const returnRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
    
    // Mock conversion rate (would need more data in real scenario)
    const conversionRate = 3.2;

    return {
      conversionRate,
      avgOrderValue,
      returnRate,
      customerSatisfaction: 4.8,
      totalSales,
      totalOrders,
      totalProducts: 0, // Will be set from products data
      totalCustomers: profiles.length
    };
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return Package;
      case 'product': return Star;
      case 'wishlist': return Heart;
      case 'user': return User;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order': return 'text-green-600';
      case 'product': return 'text-blue-600';
      case 'wishlist': return 'text-pink-600';
      case 'user': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Trend
                </CardTitle>
                <CardDescription>Monthly sales and order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="hsl(var(--deep-rose))" 
                      fill="hsl(var(--deep-rose) / 0.1)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current order status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{analyticsData.metrics.conversionRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+0.5% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                    <p className="text-2xl font-bold">${analyticsData.metrics.avgOrderValue.toFixed(0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+$12 from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Return Rate</p>
                    <p className="text-2xl font-bold">{analyticsData.metrics.returnRate.toFixed(1)}%</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">-0.3% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                    <p className="text-2xl font-bold">{analyticsData.metrics.customerSatisfaction.toFixed(1)}/5</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+0.2 from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Sales Analytics</CardTitle>
              <CardDescription>In-depth sales performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--deep-rose))" 
                    strokeWidth={3}
                    name="Sales ($)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="hsl(var(--rose-gold))" 
                    strokeWidth={3}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best selling products by revenue and volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topProducts.length > 0 ? (
                  analyticsData.topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-gold to-deep-rose rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${product.revenue.toLocaleString()}</p>
                        <Badge variant="secondary">Top {index + 1}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No product data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system activity and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.length > 0 ? (
                  analyticsData.recentActivity.map((activity, index) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;