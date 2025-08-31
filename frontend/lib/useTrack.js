import { useCallback } from 'react';
import api from './api';

export const useTrack = () => {
  const trackEvent = useCallback(async (eventType, productId) => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.warn('No user ID found for tracking');
        return;
      }
      
      await api.post('/events', {
        userId,
        productId,
        eventType,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  return { trackEvent };
};

export default useTrack;