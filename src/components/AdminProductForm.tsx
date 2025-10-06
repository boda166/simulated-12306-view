import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Upload, AlertCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductDisplay } from '@/types/product';
import { productSchema } from '@/utils/productValidation';
import { uploadProductImage, deleteProductImage, UploadedImage } from '@/utils/imageUpload';
import { toast } from 'sonner';
import { ZodError } from 'zod';

interface AdminProductFormProps {
  product?: ProductDisplay | null;
  onSave: () => void;
  onCancel: () => void;
}

const AdminProductForm = ({ product, onSave, onCancel }: AdminProductFormProps) => {
  const { createProduct, updateProduct } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || null,
    description: product?.description || '',
    categoryId: product?.categoryId || '',
    stockQuantity: product?.stockQuantity || 0,
    images: product?.images?.map(url => ({ url, is_main: false })) || [],
    colors: product?.colors || [''],
    handles: product?.handles || [''],
    inStock: product?.inStock !== false,
    featured: product?.isBestseller || false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set first image as main on load
  if (formData.images.length > 0 && !formData.images.some(img => img.is_main)) {
    formData.images[0].is_main = true;
  }

  const validateForm = () => {
    try {
      productSchema.parse({
        name: formData.name,
        price: formData.price,
        original_price: formData.originalPrice,
        stock_quantity: formData.stockQuantity,
        category_id: formData.categoryId,
        description: formData.description,
        images: formData.images,
        colors: formData.colors.filter(c => c.trim()),
        handle_types: formData.handles.filter(h => h.trim()),
        in_stock: formData.inStock,
        featured: formData.featured
      });
      
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(file => 
      uploadProductImage(file, formData.images.length === 0)
    );

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((img): img is UploadedImage => img !== null);
      
      if (successfulUploads.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...successfulUploads]
        }));
        toast.success(`${successfulUploads.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload some images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const image = formData.images[index];
    if (image.url.includes('product-images')) {
      await deleteProductImage(image.url);
    }
    
    const newImages = formData.images.filter((_, i) => i !== index);
    // If we removed the main image, make the first one main
    if (image.is_main && newImages.length > 0) {
      newImages[0].is_main = true;
    }
    
    setFormData(prev => ({ ...prev, images: newImages }));
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
        category_id: formData.categoryId,
        image_url: formData.images.find(img => img.is_main)?.url || formData.images[0]?.url,
        images: formData.images.map(img => img.url),
        colors: formData.colors.filter(color => color.trim()),
        handle_types: formData.handles.filter(handle => handle.trim()),
        product_type: 'standard' as const,
        in_stock: formData.inStock && formData.stockQuantity > 0,
        stock_quantity: formData.stockQuantity,
        featured: formData.featured,
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }

      toast.success(`Product ${product ? 'updated' : 'created'} successfully!`);
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to ${product ? 'update' : 'create'} product. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addArrayItem = (field: 'colors' | 'handles') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'colors' | 'handles', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'colors' | 'handles', index: number, value: string) => {
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
                  Product Name *
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
                  placeholder="Enter product name (min. 3 characters)"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="price" className="flex items-center gap-2">
                  Current Price ($) *
                  {errors.price && <AlertCircle className="w-4 h-4 text-red-500" />}
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price || ''}
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
                  {errors.original_price && <AlertCircle className="w-4 h-4 text-red-500" />}
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, originalPrice: e.target.value ? parseFloat(e.target.value) : null }));
                    if (errors.original_price) setErrors(prev => ({ ...prev, original_price: '' }));
                  }}
                  className={errors.original_price ? 'border-red-500' : ''}
                  placeholder="0.00 (optional)"
                />
                {errors.original_price && <p className="text-sm text-red-500 mt-1">{errors.original_price}</p>}
                <p className="text-xs text-muted-foreground mt-1">Must be greater than current price</p>
              </div>
              
              <div>
                <Label htmlFor="stockQuantity" className="flex items-center gap-2">
                  Stock Quantity *
                  {errors.stock_quantity && <AlertCircle className="w-4 h-4 text-red-500" />}
                </Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }));
                    if (errors.stock_quantity) setErrors(prev => ({ ...prev, stock_quantity: '' }));
                  }}
                  className={errors.stock_quantity ? 'border-red-500' : ''}
                  placeholder="0"
                />
                {errors.stock_quantity && <p className="text-sm text-red-500 mt-1">{errors.stock_quantity}</p>}
              </div>
              
              <div>
                <Label htmlFor="categoryId" className="flex items-center gap-2">
                  Category *
                  {errors.category_id && <AlertCircle className="w-4 h-4 text-red-500" />}
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, categoryId: value }));
                    if (errors.category_id) setErrors(prev => ({ ...prev, category_id: '' }));
                  }}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>}
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
                maxLength={500}
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
            <h3 className="text-lg font-semibold">Product Images *</h3>
            <div>
              <Label className="flex items-center gap-2">
                Images
                {errors.images && <AlertCircle className="w-4 h-4 text-red-500" />}
              </Label>
              
              {/* Image Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-border">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.is_main && (
                      <Badge className="absolute top-2 left-2" variant="default">
                        Main
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </>
                )}
              </Button>
              {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Upload JPG, PNG, or WEBP images (max 5MB each). First image will be the main product image.
              </p>
            </div>
          </div>

          {/* Product Variants */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Product Variants (Optional)</h3>
            
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
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
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
