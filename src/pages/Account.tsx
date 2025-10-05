import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { User, Mail, Phone, Edit, Package, CreditCard, Settings, ChevronDown, Truck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/stores/authStore';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    selected_color?: string;
    selected_handle?: string;
    custom_name?: string;
    products: {
      name: string;
      image_url: string;
    };
  }>;
}

const Account = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const { orders, customOrders, isLoading: ordersLoading } = useOrders();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    phone: ''
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditData({
        full_name: data.full_name || '',
        phone: data.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };


  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editData.full_name,
          phone: editData.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_production':
        return 'bg-purple-100 text-purple-800';
      case 'paid':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Combine and sort orders by date
  const allOrders: Array<{
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    type: 'regular' | 'custom';
    product_name?: string;
    description?: string;
    personalization_details?: any;
    preferred_colors?: string[];
    order_items?: any[];
    tracking_number?: string;
    carrier?: string;
    shipping_status?: string;
    shipped_at?: string;
    delivered_at?: string;
  }> = [
    ...orders.map(order => ({ 
      ...order, 
      type: 'regular' as const,
      total_amount: order.total_amount 
    })),
    ...customOrders.map(order => ({ 
      ...order, 
      type: 'custom' as const, 
      total_amount: (order.final_price || order.estimated_price || 0) as number 
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-deep-rose mb-2">My Account</h1>
              <p className="text-muted-foreground">Manage your profile and view your order history</p>
            </div>
            <Button 
              variant="hero" 
              className="flex items-center gap-2"
              onClick={() => navigate('/custom-orders')}
            >
              <Sparkles className="w-4 h-4" />
              Request Custom Order
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="w-5 h-5 text-rose-gold" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email || ''}
                          className="pl-10"
                          disabled
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="full_name"
                          placeholder="Enter your full name"
                          className="pl-10"
                          value={editData.full_name}
                          onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          className="pl-10"
                          value={editData.phone}
                          onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      variant="hero" 
                      disabled={isUpdating}
                      className="w-full sm:w-auto"
                    >
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-rose-gold" />
                    Order History
                  </CardTitle>
                  <CardDescription>View your past purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  {allOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate('/')}
                      >
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allOrders.map((order) => (
                        <Collapsible key={`${order.type}-${order.id}`}>
                          <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">
                                    {order.type === 'custom' ? 'Custom Order' : 'Order'} #{order.id.slice(0, 8)}
                                  </p>
                                  {order.type === 'regular' && (order.tracking_number || order.carrier) && (
                                    <CollapsibleTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 px-2">
                                        <Truck className="w-3 h-3 mr-1" />
                                        Track
                                        <ChevronDown className="w-3 h-3 ml-1" />
                                      </Button>
                                    </CollapsibleTrigger>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                                {order.type === 'custom' && (
                                  <p className="text-sm text-rose-600 font-medium">
                                    {order.product_name}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge className={getStatusColor(order.status)}>
                                  {order.type === 'custom' 
                                    ? order.status.replace('_', ' ').split(' ').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                      ).join(' ')
                                    : order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                  }
                                </Badge>
                                <p className="text-lg font-semibold mt-1">
                                  {order.total_amount > 0 ? (
                                    `$${order.total_amount.toFixed(2)}`
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Price pending</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid gap-2">
                              {order.type === 'regular' ? (
                                order.order_items?.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 text-sm">
                                    <img 
                                      src={item.products.image_url} 
                                      alt={item.products.name}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">{item.products.name}</p>
                                      {item.custom_name && (
                                        <p className="text-muted-foreground">Custom: {item.custom_name}</p>
                                      )}
                                      {item.selected_color && (
                                        <p className="text-muted-foreground">Color: {item.selected_color}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p>Qty: {item.quantity}</p>
                                      <p>${item.price.toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm space-y-1">
                                  <p className="font-medium">{order.product_name}</p>
                                  {order.description && (
                                    <p className="text-muted-foreground">{order.description}</p>
                                  )}
                                  {order.personalization_details?.custom_name && (
                                    <p className="text-muted-foreground">
                                      Custom Name: {order.personalization_details.custom_name}
                                    </p>
                                  )}
                                  {order.preferred_colors && order.preferred_colors.length > 0 && (
                                    <p className="text-muted-foreground">
                                      Colors: {order.preferred_colors.join(', ')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {order.type === 'regular' && (order.tracking_number || order.carrier || order.shipping_status) && (
                              <CollapsibleContent className="mt-4 pt-4 border-t">
                                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                  <p className="text-sm font-semibold flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Shipping Information
                                  </p>
                                  {order.shipping_status && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Status: </span>
                                      <span className="text-sm font-medium">
                                        {order.shipping_status.replace('_', ' ').split(' ').map(word => 
                                          word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                      </span>
                                    </div>
                                  )}
                                  {order.carrier && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Carrier: </span>
                                      <span className="text-sm">{order.carrier}</span>
                                    </div>
                                  )}
                                  {order.tracking_number && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Tracking: </span>
                                      <span className="text-sm font-mono">{order.tracking_number}</span>
                                    </div>
                                  )}
                                  {order.shipped_at && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Shipped: </span>
                                      <span className="text-sm">{new Date(order.shipped_at).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {order.delivered_at && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Delivered: </span>
                                      <span className="text-sm text-green-600">{new Date(order.delivered_at).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            )}
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-rose-gold" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account Actions</h3>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Sign Out</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sign out of your account on this device
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={handleSignOut}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;