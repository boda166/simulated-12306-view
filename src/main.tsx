import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useAuthStore } from './stores/authStore'
import { measureWebVitals } from '@/hooks/usePerformanceMonitor'
import { analytics } from '@/utils/analytics'

// Initialize analytics
analytics.init();

// Initialize auth when app starts
useAuthStore.getState().initializeAuth();

// Initialize performance monitoring
measureWebVitals();

createRoot(document.getElementById("root")!).render(<App />);
