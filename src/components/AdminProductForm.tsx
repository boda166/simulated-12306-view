import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ProductDisplay } from '@/types/product';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

interface AdminProductFormProps {
  product?: ProductDisplay | null;
  onSave: () => void;
  onCancel: () => void;
}

const AdminProductForm = ({ product, onSave, onCancel }: AdminProductFormProps) => {
  const { createProduct, updateProduct } = useProducts();
  const { toast: uiToast } = useToast();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    description: product?.description || '',
    categoryId: product?.categoryId || 'handbag',
    stockQuantity: product?.stockQuantity || 0,
    images: product?.images || [''],
    colors: product?.colors || [''],
    handles: product?.handles || [''],
    features: product?.features || [''],
    featured: product?.isBestseller || false,
    inStock: product?.inStock !== false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (formData.originalPrice && formData.originalPrice <= formData.price) {
      newErrors.originalPrice = 'Original price must be greater than current price';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock quantity cannot be negative';
    }
    
    const validImages = formData.images.filter(img => img.trim());
    if (validImages.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        original_price: formData.originalPrice || undefined,
        image_url: formData.images.filter(img => img.trim())[0] || undefined,
        images: formData.images.filter(img => img.trim()),
        colors: formData.colors.filter(color => color.trim()),
        handle_types: formData.handles.filter(handle => handle.trim()),
        product_type: 'standard' as const, // Default to standard, can be changed later
        in_stock: formData.inStock && formData.stockQuantity > 0,
        stock_quantity: formData.stockQuantity,
        featured: formData.featured,
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }

      uiToast({
        title: "Success",
        description: `Product ${product ? 'updated' : 'created'} successfully!`,
      });

      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      
      uiToast({
        title: "Error",
        description: `Failed to ${product ? 'update' : 'create'} product. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addArrayItem = (field: 'images' | 'colors' | 'handles' | 'features') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'images' | 'colors' | 'handles' | 'features', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'images' | 'colors' | 'handles' | 'features', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <Card className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product ? 'Edit Product' : 'Add New Product'}
            {product && (
              <Badge variant={product.featured ? 'default' : 'secondary'}>
                {product.featured ? 'Featured' : 'Regular'}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  Product Name
                  {errors.name && <AlertCircle className="w-4 h-4 text-red-500" />}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="Enter product name"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="price" className="flex items-center gap-2">
                  Current Price ($)
                  {errors.price && <AlertCircle className="w-4 h-4 text-red-500" />}
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
                    if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                  }}
                  className={errors.price ? 'border-red-500' : ''}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
              </div>
              
              <div>
                <Label htmlFor="originalPrice" className="flex items-center gap-2">
                  Original Price ($)
                  {errors.originalPrice && <AlertCircle className="w-4 h-4 text-red-500" />}
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }));
                    if (errors.originalPrice) setErrors(prev => ({ ...prev, originalPrice: '' }));
                  }}
                  className={errors.originalPrice ? 'border-red-500' : ''}
                  placeholder="0.00 (optional)"
                />
                {errors.originalPrice && <p className="text-sm text-red-500 mt-1">{errors.originalPrice}</p>}
                <p className="text-xs text-muted-foreground mt-1">Leave empty if no sale price</p>
              </div>
              
              <div>
                <Label htmlFor="stockQuantity" className="flex items-center gap-2">
                  Stock Quantity
                  {errors.stockQuantity && <AlertCircle className="w-4 h-4 text-red-500" />}
                </Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }));
                    if (errors.stockQuantity) setErrors(prev => ({ ...prev, stockQuantity: '' }));
                  }}
                  className={errors.stockQuantity ? 'border-red-500' : ''}
                  placeholder="0"
                />
                {errors.stockQuantity && <p className="text-sm text-red-500 mt-1">{errors.stockQuantity}</p>}
              </div>
              
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Input
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  placeholder="handbag"
                />
              </div>
            </div>
            
            {/* Switches */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
                />
                <Label htmlFor="inStock" className="flex items-center gap-2">
                  In Stock
                  {formData.inStock ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Description</h3>
            <div>
              <Label htmlFor="description" className="flex items-center gap-2">
                Description
                {errors.description && <AlertCircle className="w-4 h-4 text-red-500" />}
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                }}
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
                placeholder="Describe your product in detail..."
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>
          </div>

          {/* Product Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Images</h3>
            <div>
              <Label className="flex items-center gap-2">
                Images
                {errors.images && <AlertCircle className="w-4 h-4 text-red-500" />}
              </Label>
              {formData.images.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <Input
                      value={item}
                      onChange={(e) => updateArrayItem('images', index, e.target.value)}
                      placeholder="Enter image URL"
                      className={errors.images ? 'border-red-500' : ''}
                    />
                    {item && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('images', index)}
                    disabled={formData.images.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('images')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image URL
              </Button>
              {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                First image will be used as the main product image
              </p>
            </div>
          </div>

          {/* Product Variants */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Product Variants</h3>
            
            {/* Colors */}
            <div>
              <Label className="flex items-center gap-2">
                Available Colors
                <Badge variant="secondary">{formData.colors.filter(c => c.trim()).length}</Badge>
              </Label>
              {formData.colors.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateArrayItem('colors', index, e.target.value)}
                    placeholder="Enter color name (e.g., Midnight Black)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('colors', index)}
                    disabled={formData.colors.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('colors')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Color
              </Button>
            </div>

            {/* Handles */}
            <div>
              <Label className="flex items-center gap-2">
                Handle Types
                <Badge variant="secondary">{formData.handles.filter(h => h.trim()).length}</Badge>
              </Label>
              {formData.handles.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateArrayItem('handles', index, e.target.value)}
                    placeholder="Enter handle type (e.g., Short Handle)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('handles', index)}
                    disabled={formData.handles.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('handles')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Handle Type
              </Button>
            </div>

            {/* Features */}
            <div>
              <Label className="flex items-center gap-2">
                Key Features
                <Badge variant="secondary">{formData.features.filter(f => f.trim()).length}</Badge>
              </Label>
              {formData.features.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateArrayItem('features', index, e.target.value)}
                    placeholder="Enter product feature (e.g., Water-resistant)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('features', index)}
                    disabled={formData.features.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('features')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="hero"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminProductForm;