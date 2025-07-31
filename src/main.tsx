import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useAuthStore } from './stores/authStore'

// Initialize auth when app starts
useAuthStore.getState().initializeAuth();

createRoot(document.getElementById("root")!).render(<App />);
