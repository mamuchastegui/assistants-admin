
import { useCallback, useRef } from 'react';

export const useNotificationSound = (soundUrl: string = '/notification.mp3') => {
  // Notification sound setup - lazily initialized
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    if (!notificationSoundRef.current) {
      notificationSoundRef.current = new Audio(soundUrl);
    }
    
    const sound = notificationSoundRef.current;
    sound.currentTime = 0;
    sound.play().catch(err => console.log('Error playing notification sound:', err));
  }, [soundUrl]);
  
  return { playNotificationSound };
};
