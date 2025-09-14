import React, { useState, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ProductImage: React.FC<ProductImageProps> = memo(({
  src,
  alt,
  className = '',
  priority = false,
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={loading}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        // Add responsive image attributes for better performance
        decoding="async"
        {...(priority && { fetchPriority: 'high' as any })}
      />
    </div>
  );
});

ProductImage.displayName = 'ProductImage';

export default ProductImage;