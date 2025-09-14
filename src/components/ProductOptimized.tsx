import React, { lazy, Suspense, memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// Lazy load heavy components
const ProductImage = lazy(() => import('./ProductImage'));

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  inStock: boolean;
  featured?: boolean;
}

interface ProductOptimizedProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  onQuickView: (productId: string) => void;
  priority?: boolean; // For above-the-fold products
}

const ProductOptimized: React.FC<ProductOptimizedProps> = memo(({
  product,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  priority = false
}) => {
  const { isOptimizedMode } = useAdvancedPerformance('ProductCard');
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px', // Start loading 50px before entering viewport
  });

  // Memoize expensive calculations
  const discount = useMemo(() => {
    if (!product.originalPrice) return null;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product.originalPrice, product.price]);

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(product.price);
  }, [product.price]);

  const formattedOriginalPrice = useMemo(() => {
    if (!product.originalPrice) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(product.originalPrice);
  }, [product.originalPrice]);

  // Optimize image loading
  const primaryImage = product.images[0];
  const shouldLoadImage = priority || isVisible;

  return (
    <Card 
      ref={ref}
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-luxury ${
        isOptimizedMode ? '' : 'hover:-translate-y-2'
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-luxury-pink">
        {shouldLoadImage ? (
          <Suspense fallback={<Skeleton className="w-full h-full" />}>
            <ProductImage
              src={primaryImage}
              alt={product.name}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Suspense>
        ) : (
          <Skeleton className="w-full h-full" />
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.inStock && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-rose-gold text-white text-xs">
              Featured
            </Badge>
          )}
          {discount && (
            <Badge className="bg-green-600 text-white text-xs">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${
          isOptimizedMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={() => onAddToWishlist(product.id)}
            disabled={!product.inStock}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={() => onQuickView(product.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to Cart Overlay */}
        <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
          isOptimizedMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <Button
            className="w-full"
            onClick={() => onAddToCart(product.id)}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-playfair font-semibold text-lg text-deep-rose line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-deep-rose">
              {formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductOptimized.displayName = 'ProductOptimized';

export default ProductOptimized;