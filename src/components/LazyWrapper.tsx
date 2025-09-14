import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  rootMargin = '100px',
  threshold = 0.1,
  className = '',
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin,
    threshold,
    triggerOnce: true,
  });

  const defaultFallback = (
    <div className={`animate-pulse ${className}`}>
      <Skeleton className="w-full h-48" />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || defaultFallback)}
    </div>
  );
};

// HOC for lazy loading components
export const withLazyLoading = <P extends Record<string, any>>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={fallback || <Skeleton className="w-full h-48" />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));

  WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Preloader for critical components
export const preloadComponent = (componentLoader: () => Promise<any>) => {
  // Start loading the component immediately
  const componentPromise = componentLoader();
  
  return {
    // Return the lazy component
    Component: lazy(() => componentPromise),
    // Preload function that can be called to start loading
    preload: () => componentPromise,
  };
};

// Performance-aware lazy loading
export const SmartLazyWrapper: React.FC<LazyWrapperProps & {
  priority?: 'high' | 'low' | 'auto';
}> = ({
  children,
  fallback,
  rootMargin = '100px',
  threshold = 0.1,
  className = '',
  priority = 'auto',
}) => {
  // Adjust loading behavior based on priority and connection
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g'
  );

  // Adjust root margin based on connection speed and priority
  let adjustedRootMargin = rootMargin;
  if (priority === 'high' || (priority === 'auto' && !isSlowConnection)) {
    adjustedRootMargin = '200px'; // Load earlier for high priority or fast connections
  } else if (isSlowConnection) {
    adjustedRootMargin = '50px'; // Load later for slow connections
  }

  const [ref, isVisible] = useIntersectionObserver({
    rootMargin: adjustedRootMargin,
    threshold,
    triggerOnce: true,
  });

  const defaultFallback = (
    <div className={`animate-pulse ${className}`}>
      <Skeleton className="w-full h-48" />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || defaultFallback)}
    </div>
  );
};

export default LazyWrapper;