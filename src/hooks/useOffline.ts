import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface OfflineState {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnline: Date | null;
}

export const useOffline = () => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isReconnecting: false,
    lastOnline: navigator.onLine ? new Date() : null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        isOnline: true,
        isReconnecting: false,
        lastOnline: new Date(),
      }));

      toast({
        title: "Connection Restored",
        description: "You're back online! Your data will now sync.",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isOnline: false,
        isReconnecting: false,
      }));

      toast({
        title: "You're Offline",
        description: "Your changes will be saved and synced when you reconnect.",
        variant: "destructive",
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection periodically when offline
    const intervalId = setInterval(() => {
      if (!navigator.onLine && state.isOnline) {
        handleOffline();
      } else if (navigator.onLine && !state.isOnline) {
        setState(prev => ({ ...prev, isReconnecting: true }));
        
        // Simulate checking connection to server
        fetch('/ping', { method: 'HEAD' })
          .then(() => handleOnline())
          .catch(() => {
            setState(prev => ({ ...prev, isReconnecting: false }));
          });
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [state.isOnline]);

  return state;
};

// Hook for offline storage
export const useOfflineStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(`offline_${key}`);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setOfflineValue = (newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(`offline_${key}`, JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to save to offline storage:', error);
    }
  };

  const clearOfflineValue = () => {
    try {
      setValue(initialValue);
      localStorage.removeItem(`offline_${key}`);
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
    }
  };

  return [value, setOfflineValue, clearOfflineValue] as const;
};

// Hook for queuing actions while offline
export const useOfflineQueue = () => {
  type QueueItem = {
    id: string;
    action: string;
    data: any;
    timestamp: number;
  };

  const [queue, setQueue, clearQueue] = useOfflineStorage<QueueItem[]>('action_queue', []);

  const { isOnline } = useOffline();

  const addToQueue = (action: string, data: any) => {
    const queueItem: QueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: Date.now(),
    };

    setQueue([...queue, queueItem]);
    return queueItem.id;
  };

  const removeFromQueue = (id: string) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  const processQueue = async (processor: (action: string, data: any) => Promise<void>) => {
    if (!isOnline || queue.length === 0) return;

    const queueCopy = [...queue];
    
    for (const item of queueCopy) {
      try {
        await processor(item.action, item.data);
        removeFromQueue(item.id);
        
        toast({
          title: "Sync Complete",
          description: `${item.action} has been synced.`,
          duration: 2000,
        });
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error);
        
        // Remove items older than 24 hours to prevent infinite retry
        if (Date.now() - item.timestamp > 24 * 60 * 60 * 1000) {
          removeFromQueue(item.id);
          
          toast({
            title: "Sync Failed",
            description: `Failed to sync ${item.action}. Item removed from queue.`,
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    }
  };

  return {
    queue,
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
    queueSize: queue.length,
  };
};