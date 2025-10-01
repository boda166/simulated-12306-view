import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Order } from '@/hooks/useOrders';
import { Package, Truck, MapPin, CheckCircle } from 'lucide-react';

interface ShippingManagementDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (orderId: string, shippingData: {
    tracking_number?: string;
    carrier?: string;
    shipping_status?: string;
  }) => Promise<void>;
}

const CARRIERS = [
  'USPS',
  'FedEx',
  'UPS',
  'DHL',
  'Amazon Logistics',
  'OnTrac',
  'Other'
];

const SHIPPING_STATUSES = [
  { value: 'pending', label: 'Pending', icon: Package },
  { value: 'preparing', label: 'Preparing', icon: Package },
  { value: 'shipped', label: 'Shipped', icon: Truck },
  { value: 'in_transit', label: 'In Transit', icon: MapPin },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
  { value: 'returned', label: 'Returned', icon: Package }
];

export const ShippingManagementDialog = ({ order, open, onOpenChange, onUpdate }: ShippingManagementDialogProps) => {
  const [formData, setFormData] = useState({
    tracking_number: order?.tracking_number || '',
    carrier: order?.carrier || '',
    shipping_status: order?.shipping_status || 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      await onUpdate(order.id, formData);
      onOpenChange(false);
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Shipping</DialogTitle>
          <DialogDescription>
            Update shipping information for Order #{order.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="shipping_status">Shipping Status</Label>
            <Select
              value={formData.shipping_status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, shipping_status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {SHIPPING_STATUSES.map((status) => {
                  const Icon = status.icon;
                  return (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {status.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier</Label>
            <Select
              value={formData.carrier}
              onValueChange={(value) => setFormData(prev => ({ ...prev, carrier: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {CARRIERS.map((carrier) => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking_number">Tracking Number</Label>
            <Input
              id="tracking_number"
              placeholder="Enter tracking number"
              value={formData.tracking_number}
              onChange={(e) => setFormData(prev => ({ ...prev, tracking_number: e.target.value }))}
            />
          </div>

          {order.shipped_at && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Shipped: {new Date(order.shipped_at).toLocaleString()}
              </p>
            </div>
          )}

          {order.delivered_at && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                Delivered: {new Date(order.delivered_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Shipping'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
