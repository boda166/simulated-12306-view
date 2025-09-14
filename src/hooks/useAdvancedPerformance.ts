import { useState, useEffect, useRef, useCallback } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  connectionType: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  batteryLevel?: number;
  isLowEndDevice: boolean;
}

interface ResourceTiming {
  name: string;
  duration: number;
  transferSize: number;
  decodedBodySize: number;
}

export const useAdvancedPerformance = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [resourceTimings, setResourceTimings] = useState<ResourceTiming[]>([]);
  const [isOptimizedMode, setIsOptimizedMode] = useState(false);
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const { renderCount } = usePerformanceMonitor(componentName);

  // Custom event tracking function
  const trackEvent = useCallback((eventName: string, data: any) => {
    const eventData = {
      component: componentName,
      event: eventName,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    if (process.env.NODE_ENV === 'production') {
      // Send to analytics service
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }).catch(() => {
        // Fail silently for analytics
      });
    } else {
      console.log(`Performance Event [${componentName}]:`, eventName, data);
    }
  }, [componentName]);

  // Detect device capabilities
  const detectDeviceCapabilities = useCallback((): PerformanceMetrics['deviceType'] => {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }, []);

  // Check if device is low-end
  const isLowEndDevice = useCallback((): boolean => {
    // Check various indicators
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const deviceMemory = (navigator as any).deviceMemory || 1;
    const connection = (navigator as any).connection;
    
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g'
    );
    
    return hardwareConcurrency <= 2 || deviceMemory <= 2 || isSlowConnection;
  }, []);

  // Get battery information
  const getBatteryInfo = useCallback(async (): Promise<number | undefined> => {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return battery.level * 100;
      }
    } catch (error) {
      console.debug('Battery API not supported');
    }
    return undefined;
  }, []);

  // Measure Core Web Vitals
  const measureWebVitals = useCallback(() => {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        trackEvent('LCP', { value: lastEntry.startTime });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          trackEvent('FID', { value: entry.processingStart - entry.startTime });
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        trackEvent('CLS', { value: clsValue });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      performanceObserver.current = lcpObserver; // Store one for cleanup
    }
  }, [trackEvent]);

  // Collect resource timing data
  const collectResourceTimings = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const timings: ResourceTiming[] = resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      transferSize: resource.transferSize || 0,
      decodedBodySize: resource.decodedBodySize || 0,
    }));
    
    setResourceTimings(timings);
    
    // Track large resources
    const largeResources = timings.filter(r => r.transferSize > 500000); // > 500KB
    if (largeResources.length > 0) {
      trackEvent('large_resources_detected', { count: largeResources.length });
    }
  }, [trackEvent]);

  // Adaptive performance optimization
  const optimizeForDevice = useCallback(async () => {
    const deviceType = detectDeviceCapabilities();
    const lowEnd = isLowEndDevice();
    const batteryLevel = await getBatteryInfo();
    const connection = (navigator as any).connection;

    const shouldOptimize = lowEnd || 
      (batteryLevel && batteryLevel < 20) ||
      (connection && connection.saveData);

    setIsOptimizedMode(shouldOptimize);

    if (shouldOptimize) {
      // Apply performance optimizations
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
      
      trackEvent('performance_optimization_enabled', {
        reason: lowEnd ? 'low_end_device' : batteryLevel && batteryLevel < 20 ? 'low_battery' : 'data_saver'
      });
    }

    setMetrics({
      loadTime: performance.timing.loadEventEnd - performance.timing.loadEventStart,
      renderTime: performance.timing.domContentLoadedEventEnd - performance.timing.domContentLoadedEventStart,
      interactionTime: 0, // Will be updated by interaction observers
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      connectionType: connection?.effectiveType || 'unknown',
      deviceType,
      batteryLevel,
      isLowEndDevice: lowEnd,
    });
  }, [detectDeviceCapabilities, isLowEndDevice, getBatteryInfo, trackEvent]);

  // Memory monitoring
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };

      // Alert if memory usage is high
      const usagePercentage = (memoryUsage.used / memoryUsage.limit) * 100;
      if (usagePercentage > 80) {
        trackEvent('high_memory_usage', { percentage: usagePercentage });
        console.warn('High memory usage detected:', usagePercentage + '%');
      }

      return memoryUsage;
    }
    return null;
  }, [trackEvent]);

  // Long task monitoring
  const monitorLongTasks = useCallback(() => {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          trackEvent('long_task_detected', { 
            duration: entry.duration,
            startTime: entry.startTime 
          });
          
          if (entry.duration > 100) {
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        });
      });
      
      try {
        longTaskObserver.observe({ type: 'longtask', buffered: true });
        return () => longTaskObserver.disconnect();
      } catch (e) {
        console.debug('Long task observer not supported');
      }
    }
    return () => {};
  }, [trackEvent]);

  // Performance recommendations
  const getPerformanceRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];
    
    if (resourceTimings.length > 0) {
      const totalSize = resourceTimings.reduce((sum, r) => sum + r.transferSize, 0);
      if (totalSize > 2000000) { // > 2MB
        recommendations.push('Consider optimizing resource sizes');
      }
    }

    if (metrics) {
      if (metrics.loadTime > 3000) {
        recommendations.push('Page load time is slow');
      }
      
      if (metrics.isLowEndDevice) {
        recommendations.push('Enable performance optimizations for low-end devices');
      }
      
      if (metrics.batteryLevel && metrics.batteryLevel < 20) {
        recommendations.push('Reduce animations and effects for low battery');
      }
    }

    return recommendations;
  }, [metrics, resourceTimings]);

  useEffect(() => {
    optimizeForDevice();
    measureWebVitals();
    collectResourceTimings();
    const cleanupLongTasks = monitorLongTasks();

    // Monitor memory every 30 seconds
    const memoryInterval = setInterval(monitorMemoryUsage, 30000);

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      cleanupLongTasks();
      clearInterval(memoryInterval);
    };
  }, []);

  return {
    metrics,
    resourceTimings,
    isOptimizedMode,
    recommendations: getPerformanceRecommendations(),
    refreshMetrics: optimizeForDevice,
    memoryUsage: monitorMemoryUsage(),
  };
};