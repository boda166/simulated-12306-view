// Analytics utility for tracking user interactions and business metrics
import '@/types/analytics';
import { logger } from './logger';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

interface EcommerceEvent {
  event: string;
  ecommerce: {
    currency: string;
    value: number;
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
  };
}

class Analytics {
  private initialized = false;
  private userId: string | null = null;

  // Initialize analytics
  init(userId?: string) {
    this.userId = userId || null;
    this.initialized = true;

    // Initialize Google Analytics (if gtag is available)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: this.userId,
      });
    }

    // Track page view on initialization
    this.pageView(window.location.pathname);
  }

  // Set user ID
  setUserId(userId: string) {
    this.userId = userId;
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
      });
    }
  }

  // Track page views
  pageView(path: string, title?: string) {
    if (!this.initialized) return;

    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: {
        page_path: path,
        page_title: title || document.title,
        timestamp: Date.now(),
      },
      userId: this.userId,
    };

    this.sendEvent(event);

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: title || document.title,
        page_location: window.location.href,
        page_path: path,
      });
    }
  }

  // Track custom events
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
      },
      userId: this.userId,
    };

    this.sendEvent(event);

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties);
    }
  }

  // E-commerce tracking
  trackPurchase(orderId: string, items: any[], total: number) {
    const ecommerceEvent: EcommerceEvent = {
      event: 'purchase',
      ecommerce: {
        currency: 'USD',
        value: total,
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          category: item.category || 'Bags',
          quantity: item.quantity,
          price: item.price,
        })),
      },
    };

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        value: total,
        currency: 'USD',
        items: ecommerceEvent.ecommerce.items,
      });
    }

    this.track('purchase_completed', {
      order_id: orderId,
      total_amount: total,
      item_count: items.length,
      items: items,
    });
  }

  trackAddToCart(item: any) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: item.price * item.quantity,
        items: [{
          item_id: item.id,
          item_name: item.name,
          category: item.category || 'Bags',
          quantity: item.quantity,
          price: item.price,
        }],
      });
    }

    this.track('add_to_cart', {
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
    });
  }

  trackRemoveFromCart(item: any) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        currency: 'USD',
        value: item.price * item.quantity,
        items: [{
          item_id: item.id,
          item_name: item.name,
          category: item.category || 'Bags',
          quantity: item.quantity,
          price: item.price,
        }],
      });
    }

    this.track('remove_from_cart', {
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
    });
  }

  trackViewItem(item: any) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'USD',
        value: item.price,
        items: [{
          item_id: item.id,
          item_name: item.name,
          category: item.category || 'Bags',
          price: item.price,
        }],
      });
    }

    this.track('product_viewed', {
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      category: item.category,
    });
  }

  trackSearch(searchTerm: string, resultsCount: number) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm,
      });
    }

    this.track('search_performed', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }

  trackSignUp(method: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method,
      });
    }

    this.track('user_registered', {
      method: method,
    });
  }

  trackLogin(method: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method: method,
      });
    }

    this.track('user_logged_in', {
      method: method,
    });
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      context: context,
      url: window.location.href,
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string) {
    this.track('performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit,
      page: window.location.pathname,
    });
  }

  // Private method to send events to analytics services
  private sendEvent(event: AnalyticsEvent) {
    // Send to your analytics backend
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(error => {
        logger.error('Failed to send analytics event:', error);
      });
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    pageView: analytics.pageView.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackAddToCart: analytics.trackAddToCart.bind(analytics),
    trackRemoveFromCart: analytics.trackRemoveFromCart.bind(analytics),
    trackViewItem: analytics.trackViewItem.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackSignUp: analytics.trackSignUp.bind(analytics),
    trackLogin: analytics.trackLogin.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
  };
};

export default analytics;