import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-muted rounded', className)} />
);

export const ProductCardSkeleton = () => (
  <div className="space-y-3">
    <LoadingSkeleton className="h-48 w-full" />
    <LoadingSkeleton className="h-4 w-3/4" />
    <LoadingSkeleton className="h-4 w-1/2" />
    <LoadingSkeleton className="h-8 w-full" />
  </div>
);

export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default Loading;