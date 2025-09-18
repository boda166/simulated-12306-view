import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Edit3, DollarSign } from 'lucide-react';
import { useAdminCustomOrders } from '@/hooks/useAdminCustomOrders';
import { CustomOrder, getStatusLabel, getStatusColor, CustomOrderStatus } from '@/types/customOrder';
import { toast } from 'sonner';

const AdminCustomOrders = () => {
  const { customOrders, isLoading, updateCustomOrderStatus } = useAdminCustomOrders();
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '' as CustomOrderStatus,
    admin_notes: '',
    estimated_price: '',
    final_price: ''
  });

  const handleViewDetails = (order: CustomOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleEditOrder = (order: CustomOrder) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status,
      admin_notes: order.admin_notes || '',
      estimated_price: order.estimated_price?.toString() || '',
      final_price: order.final_price?.toString() || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;

    try {
      await updateCustomOrderStatus({
        id: selectedOrder.id,
        status: editForm.status,
        admin_notes: editForm.admin_notes || undefined,
        estimated_price: editForm.estimated_price ? parseFloat(editForm.estimated_price) : undefined,
        final_price: editForm.final_price ? parseFloat(editForm.final_price) : undefined
      });
      setIsEditOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Custom Orders</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Custom Orders</h2>
        <Badge variant="secondary" className="text-sm">
          {customOrders.length} Total Orders
        </Badge>
      </div>

      {customOrders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No custom orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {customOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.product_name}</CardTitle>
                    <CardDescription>
                      Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOrder(order)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Customer Details</p>
                    <p className="text-muted-foreground">User ID: {order.user_id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Personalization</p>
                    {order.personalization_details.custom_name && (
                      <p className="text-muted-foreground">Name: {order.personalization_details.custom_name}</p>
                    )}
                  </div>
                  <div>
                    <p className="font-medium mb-1">Pricing</p>
                    {order.estimated_price && (
                      <p className="text-muted-foreground">Estimated: ${order.estimated_price}</p>
                    )}
                    {order.final_price && (
                      <p className="text-green-600">Final: ${order.final_price}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Product Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.product_name}</p>
                  {selectedOrder.description && (
                    <p><strong>Description:</strong> {selectedOrder.description}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Personalization Details</h4>
                <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                  {selectedOrder.personalization_details.custom_name && (
                    <p>Custom Name: {selectedOrder.personalization_details.custom_name}</p>
                  )}
                  {selectedOrder.personalization_details.font_style && (
                    <p>Font Style: {selectedOrder.personalization_details.font_style}</p>
                  )}
                  {selectedOrder.personalization_details.placement && (
                    <p>Placement: {selectedOrder.personalization_details.placement}</p>
                  )}
                  {selectedOrder.personalization_details.special_requests && (
                    <p>Special Requests: {selectedOrder.personalization_details.special_requests}</p>
                  )}
                </div>
              </div>

              {(selectedOrder.preferred_colors?.length || selectedOrder.preferred_handles?.length) && (
                <div>
                  <h4 className="font-medium mb-2">Preferences</h4>
                  <div className="space-y-1">
                    {selectedOrder.preferred_colors?.length && (
                      <p>Colors: {selectedOrder.preferred_colors.join(', ')}</p>
                    )}
                    {selectedOrder.preferred_handles?.length && (
                      <p>Handles: {selectedOrder.preferred_handles.join(', ')}</p>
                    )}
                    {selectedOrder.budget_range && (
                      <p>Budget: {selectedOrder.budget_range}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedOrder.admin_notes && (
                <div>
                  <h4 className="font-medium mb-2">Admin Notes</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p>{selectedOrder.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Custom Order</DialogTitle>
            <DialogDescription>
              Update order status and details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select 
                value={editForm.status} 
                onValueChange={(value: CustomOrderStatus) => setEditForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="in_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_production">In Production</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimated Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.estimated_price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, estimated_price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Final Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.final_price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, final_price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={editForm.admin_notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                placeholder="Add notes for the customer..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomOrders;