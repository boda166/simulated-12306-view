import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Package, User, MapPin, Phone, Mail, Truck } from 'lucide-react';
import { Order } from '@/hooks/useOrders';
import { ShippingManagementDialog } from './ShippingManagementDialog';
import { toast } from 'sonner';

interface AdminOrderDetailsProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onUpdateShipping: (orderId: string, shippingData: {
    tracking_number?: string;
    carrier?: string;
    shipping_status?: string;
  }) => Promise<void>;
  onClose: () => void;
}

const AdminOrderDetails = ({ order, onUpdateStatus, onUpdateShipping, onClose }: AdminOrderDetailsProps) => {
  const [status, setStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showShippingDialog, setShowShippingDialog] = useState(false);

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, newStatus);
      setStatus(newStatus);
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Details - #{order.id}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Status & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Status</p>
              <Badge className={getStatusColor(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                <Select value={status} onValueChange={handleStatusUpdate} disabled={isUpdating}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Shipping Management</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowShippingDialog(true)}
              >
                <Truck className="w-4 h-4 mr-2" />
                Manage Shipping
              </Button>
              {order.tracking_number && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Tracking</p>
                  <p className="text-sm font-mono">{order.tracking_number}</p>
                  {order.carrier && (
                    <p className="text-xs text-muted-foreground mt-1">{order.carrier}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{order.contact_info?.firstName} {order.contact_info?.lastName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{order.contact_info?.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{order.contact_info?.phone}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                <span className="text-sm">{order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zipCode}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items
            </h3>
            <div className="space-y-3">
              {order.order_items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">{item.products?.name || `Product ID: ${item.product_id}`}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    <p className="text-sm text-muted-foreground">Price: ${item.price.toFixed(2)}</p>
                    {item.custom_name && (
                      <p className="text-sm text-muted-foreground">Custom Name: {item.custom_name}</p>
                    )}
                    {item.selected_color && (
                      <p className="text-sm text-muted-foreground">Color: {item.selected_color}</p>
                    )}
                    {item.selected_handle && (
                      <p className="text-sm text-muted-foreground">Handle: {item.selected_handle}</p>
                    )}
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground">No items found</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ShippingManagementDialog
        order={order}
        open={showShippingDialog}
        onOpenChange={setShowShippingDialog}
        onUpdate={onUpdateShipping}
      />
    </div>
  );
};

export default AdminOrderDetails;