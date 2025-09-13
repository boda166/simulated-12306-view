// Global type declarations for analytics

declare global {
  function gtag(...args: any[]): void;
  
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export {};