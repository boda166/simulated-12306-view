import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCustomOrders } from '@/hooks/useCustomOrders';
import { CreateCustomOrderInput, PersonalizationDetails } from '@/types/customOrder';
import { toast } from 'sonner';

interface CreateCustomOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCustomOrderDialog = ({ open, onOpenChange }: CreateCustomOrderDialogProps) => {
  const { createCustomOrder, isLoading } = useCustomOrders();
  
  // Form state
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [customName, setCustomName] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [placement, setPlacement] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();

  const availableColors = ['Black', 'White', 'Brown', 'Rose Gold', 'Navy', 'Burgundy', 'Cream', 'Gold'];
  const availableHandles = ['Short Handle', 'Long Handle', 'Chain Handle', 'Detachable Strap', 'No Handle'];
  const budgetRanges = ['Under $100', '$100 - $200', '$200 - $300', '$300 - $500', '$500+', 'Open to discuss'];
  const fontStyles = ['Script', 'Block Letters', 'Cursive', 'Modern', 'Classic', 'Custom'];
  const placements = ['Front Center', 'Front Bottom', 'Inside Pouch', 'Back', 'Side', 'Custom Location'];

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleHandleToggle = (handle: string) => {
    setSelectedHandles(prev => 
      prev.includes(handle) 
        ? prev.filter(h => h !== handle)
        : [...prev, handle]
    );
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setCustomName('');
    setFontStyle('');
    setPlacement('');
    setSpecialRequests('');
    setSelectedColors([]);
    setSelectedHandles([]);
    setBudgetRange('');
    setDeliveryDate(undefined);
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    try {
      const personalizationDetails: PersonalizationDetails = {
        custom_name: customName || undefined,
        font_style: fontStyle || undefined,
        placement: placement || undefined,
        special_requests: specialRequests || undefined
      };

      const orderData: CreateCustomOrderInput = {
        product_name: productName,
        description: description || undefined,
        personalization_details: personalizationDetails,
        preferred_colors: selectedColors.length > 0 ? selectedColors : undefined,
        preferred_handles: selectedHandles.length > 0 ? selectedHandles : undefined,
        budget_range: budgetRange || undefined,
        delivery_date: deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : undefined
      };

      await createCustomOrder(orderData);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Order</DialogTitle>
          <DialogDescription>
            Tell us about your dream handbag and we'll create it just for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                placeholder="e.g., Custom Evening Clutch"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your vision for this custom handbag..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Personalization Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personalization Options</h3>
            
            <div>
              <Label htmlFor="custom-name">Custom Name/Text</Label>
              <Input
                id="custom-name"
                placeholder="Name or text to add to the bag"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Font Style</Label>
                <Select value={fontStyle} onValueChange={setFontStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose font style" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border">
                    {fontStyles.map((style) => (
                      <SelectItem key={style} value={style}>{style}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Text Placement</Label>
                <Select value={placement} onValueChange={setPlacement}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose placement" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border">
                    {placements.map((place) => (
                      <SelectItem key={place} value={place}>{place}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="special-requests">Special Requests</Label>
              <Textarea
                id="special-requests"
                placeholder="Any additional customization requests..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Color Preferences */}
          <div>
            <Label className="text-base">Preferred Colors</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableColors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={selectedColors.includes(color)}
                    onCheckedChange={() => handleColorToggle(color)}
                  />
                  <Label htmlFor={`color-${color}`} className="text-sm">{color}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Handle Preferences */}
          <div>
            <Label className="text-base">Handle Type Preferences</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableHandles.map((handle) => (
                <div key={handle} className="flex items-center space-x-2">
                  <Checkbox
                    id={`handle-${handle}`}
                    checked={selectedHandles.includes(handle)}
                    onCheckedChange={() => handleHandleToggle(handle)}
                  />
                  <Label htmlFor={`handle-${handle}`} className="text-sm">{handle}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Budget and Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Budget Range</Label>
              <Select value={budgetRange} onValueChange={setBudgetRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Preferred Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-rose-gold hover:bg-rose-gold/90 text-white"
          >
            {isLoading ? 'Submitting...' : 'Submit Custom Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};