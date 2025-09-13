import { useEffect, useRef } from 'react';
import '@/types/analytics';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  connectionType?: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const mountTime = useRef<number>();
  const renderCount = useRef(0);

  useEffect(() => {
    mountTime.current = performance.now();
    renderCount.current += 1;

    // Measure render time
    const renderStartTime = performance.now();
    
    const measureRender = () => {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;

      // Log performance metrics
      const metrics: PerformanceMetrics = {
        loadTime: mountTime.current ? renderEndTime - mountTime.current : 0,
        renderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize,
        connectionType: (navigator as any).connection?.effectiveType,
      };

      // In production, send to analytics service
      if (process.env.NODE_ENV === 'production') {
        logPerformanceMetrics(componentName, metrics, renderCount.current);
      } else {
        console.log(`Performance [${componentName}]:`, metrics);
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(measureRender);
    } else {
      setTimeout(measureRender, 0);
    }
  });

  return { renderCount: renderCount.current };
};

const logPerformanceMetrics = (
  componentName: string,
  metrics: PerformanceMetrics,
  renderCount: number
) => {
  // Send to your analytics service (Google Analytics, Mixpanel, etc.)
  const performanceData = {
    component: componentName,
    ...metrics,
    renderCount,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Example: Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'performance_metric', {
      custom_parameter_1: componentName,
      custom_parameter_2: metrics.loadTime,
      custom_parameter_3: metrics.renderTime,
    });
  }

  // Example: Send to custom analytics endpoint
  fetch('/api/analytics/performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(performanceData),
  }).catch(() => {
    // Fail silently for analytics
  });
};

export const measureWebVitals = () => {
  // Measure Core Web Vitals
  const measureCLS = () => {
    let clsValue = 0;
    let clsEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = clsEntries[0];
          const lastSessionEntry = clsEntries[clsEntries.length - 1];

          if (!firstSessionEntry || 
              entry.startTime - lastSessionEntry.startTime < 1000 ||
              entry.startTime - firstSessionEntry.startTime < 5000) {
            clsEntries.push(entry);
            clsValue += (entry as any).value;
          }
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
    return () => observer.disconnect();
  };

  const measureFCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        console.log('FCP:', fcpEntry.startTime);
      }
    });

    observer.observe({ type: 'paint', buffered: true });
    return () => observer.disconnect();
  };

  const measureLCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    return () => observer.disconnect();
  };

  // Initialize measurements
  const cleanupFunctions = [
    measureCLS(),
    measureFCP(),
    measureLCP(),
  ];

  return () => cleanupFunctions.forEach(cleanup => cleanup?.());
};