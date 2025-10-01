import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Order } from '@/hooks/useOrders';

interface OrderTrackingCardProps {
  order: Order;
}

const getShippingStatusConfig = (status?: string) => {
  const configs = {
    pending: { label: 'Pending', icon: Clock, color: 'bg-gray-100 text-gray-800' },
    preparing: { label: 'Preparing', icon: Package, color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800' },
    in_transit: { label: 'In Transit', icon: MapPin, color: 'bg-orange-100 text-orange-800' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    returned: { label: 'Returned', icon: Package, color: 'bg-red-100 text-red-800' }
  };
  
  return configs[status as keyof typeof configs] || configs.pending;
};

export const OrderTrackingCard = ({ order }: OrderTrackingCardProps) => {
  const statusConfig = getShippingStatusConfig(order.shipping_status);
  const Icon = statusConfig.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Shipping Information</CardTitle>
          <Badge className={statusConfig.color}>
            <Icon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {order.carrier && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Carrier</p>
            <p className="text-base">{order.carrier}</p>
          </div>
        )}

        {order.tracking_number && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tracking Number</p>
            <p className="text-base font-mono">{order.tracking_number}</p>
          </div>
        )}

        {order.shipped_at && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Shipped Date</p>
            <p className="text-base">{new Date(order.shipped_at).toLocaleDateString()}</p>
          </div>
        )}

        {order.delivered_at && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Delivered Date</p>
            <p className="text-base text-green-600">{new Date(order.delivered_at).toLocaleDateString()}</p>
          </div>
        )}

        {!order.tracking_number && !order.carrier && (
          <div className="text-sm text-muted-foreground">
            Tracking information will be available once your order ships.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
