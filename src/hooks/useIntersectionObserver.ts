import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] => {
  const {
    threshold = 0,
    rootMargin = '0px',
    root = null,
    triggerOnce = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        if (isIntersecting) {
          setIsVisible(true);
          
          // If triggerOnce is true, disconnect observer after first intersection
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, root, triggerOnce]);

  return [ref, isVisible];
};

// Hook for lazy loading images
export const useLazyImage = (src: string, options: UseIntersectionObserverOptions = {}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [ref, isVisible] = useIntersectionObserver(options);

  useEffect(() => {
    if (isVisible && !imageSrc) {
      setImageSrc(src);
    }
  }, [isVisible, src, imageSrc]);

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setError(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoaded(false);
    };

    img.src = imageSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    error,
    isVisible,
  };
};

// Hook for detecting when element enters/leaves viewport
export const useViewportEntry = (
  options: UseIntersectionObserverOptions = {}
) => {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        setEntries(observerEntries);
      },
      {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || '0px',
        root: options.root || null,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin, options.root]);

  return [ref, entries] as const;
};