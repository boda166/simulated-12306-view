import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, AlertTriangle } from 'lucide-react';

interface StockManagementDialogProps {
  product: {
    id: string;
    name: string;
    stock_quantity: number;
    in_stock: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (productId: string, stockData: {
    stock_quantity: number;
    in_stock: boolean;
  }) => Promise<void>;
}

export const StockManagementDialog = ({ product, open, onOpenChange, onUpdate }: StockManagementDialogProps) => {
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      await onUpdate(product.id, {
        stock_quantity: stockQuantity,
        in_stock: stockQuantity > 0
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;
  const isOutOfStock = stockQuantity <= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Manage Stock
          </DialogTitle>
          <DialogDescription>
            Update inventory for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Current Stock Level</Label>
            <div className="flex items-center gap-2">
              <Input
                id="stock"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="text-lg font-semibold"
              />
              <span className="text-muted-foreground">units</span>
            </div>
          </div>

          {isOutOfStock && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This product is out of stock and won't be available for purchase.
              </AlertDescription>
            </Alert>
          )}

          {isLowStock && !isOutOfStock && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Stock level is low. Consider reordering soon.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Previous Stock:</span>
              <span className="font-medium">{product.stock_quantity} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">New Stock:</span>
              <span className="font-medium">{stockQuantity} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Change:</span>
              <span className={`font-medium ${stockQuantity > product.stock_quantity ? 'text-green-600' : stockQuantity < product.stock_quantity ? 'text-red-600' : ''}`}>
                {stockQuantity > product.stock_quantity ? '+' : ''}{stockQuantity - product.stock_quantity} units
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
