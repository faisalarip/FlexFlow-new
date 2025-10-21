import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationManager() {
  // This component uses the useNotifications hook to set up notification checking
  // It doesn't render anything visible, just manages notifications in the background
  useNotifications();
  
  return null;
}
