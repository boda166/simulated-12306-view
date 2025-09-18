import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useCustomOrders } from '@/hooks/useCustomOrders';
import { useAuthStore } from '@/stores/authStore';
import { getStatusLabel, getStatusColor } from '@/types/customOrder';
import { CreateCustomOrderDialog } from '@/components/CreateCustomOrderDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CustomOrders = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { customOrders, isLoading } = useCustomOrders();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleCreateOrder = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to create custom orders');
      navigate('/auth');
      return;
    }
    setIsCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Custom Orders - Handcrafted Beaded Bags"
          description="Create personalized custom orders for handcrafted beaded bags with your own specifications."
        />
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Custom Orders - Handcrafted Beaded Bags"
        description="Create personalized custom orders for handcrafted beaded bags with your own specifications and design preferences."
      />
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-deep-rose mb-2">
                Custom Orders
              </h1>
              <p className="text-muted-foreground">
                Create personalized handbags tailored to your unique style and preferences
              </p>
            </div>
            <Button 
              onClick={handleCreateOrder}
              className="bg-rose-gold hover:bg-rose-gold/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Custom Order
            </Button>
          </div>

          {/* Custom Orders List */}
          {customOrders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-semibold mb-2">No Custom Orders Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your journey with a personalized handbag designed just for you
                  </p>
                  <Button 
                    onClick={handleCreateOrder}
                    className="bg-rose-gold hover:bg-rose-gold/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Custom Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {customOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{order.product_name}</CardTitle>
                        <CardDescription>
                          Order #{order.id.slice(0, 8)} • Created on{' '}
                          {new Date(order.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.description && (
                        <p className="text-muted-foreground">{order.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Personalization Details */}
                        <div>
                          <h4 className="font-medium mb-2">Personalization</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {order.personalization_details.custom_name && (
                              <p>Custom Name: {order.personalization_details.custom_name}</p>
                            )}
                            {order.personalization_details.font_style && (
                              <p>Font Style: {order.personalization_details.font_style}</p>
                            )}
                            {order.personalization_details.placement && (
                              <p>Placement: {order.personalization_details.placement}</p>
                            )}
                            {order.personalization_details.special_requests && (
                              <p>Special Requests: {order.personalization_details.special_requests}</p>
                            )}
                          </div>
                        </div>

                        {/* Preferences */}
                        <div>
                          <h4 className="font-medium mb-2">Preferences</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {order.preferred_colors && order.preferred_colors.length > 0 && (
                              <p>Colors: {order.preferred_colors.join(', ')}</p>
                            )}
                            {order.preferred_handles && order.preferred_handles.length > 0 && (
                              <p>Handles: {order.preferred_handles.join(', ')}</p>
                            )}
                            {order.budget_range && (
                              <p>Budget: {order.budget_range}</p>
                            )}
                            {order.delivery_date && (
                              <p>Preferred Delivery: {new Date(order.delivery_date).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      {(order.estimated_price || order.final_price) && (
                        <div className="flex items-center gap-4 pt-2 border-t">
                          {order.estimated_price && (
                            <p className="text-sm">
                              Estimated Price: <span className="font-medium">${order.estimated_price}</span>
                            </p>
                          )}
                          {order.final_price && (
                            <p className="text-sm">
                              Final Price: <span className="font-medium text-green-600">${order.final_price}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Admin Notes */}
                      {order.admin_notes && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <h4 className="font-medium text-sm mb-1">Admin Notes</h4>
                          <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      <CreateCustomOrderDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};

export default CustomOrders;