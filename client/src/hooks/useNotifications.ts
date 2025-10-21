import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface NotificationPreferences {
  id: string;
  userId: string;
  workoutRemindersEnabled: boolean;
  mealNotificationsEnabled: boolean;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  notificationPermissionGranted: boolean;
  lastWorkoutReminderSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function useNotifications() {
  // Fetch notification preferences
  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notification-preferences'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Function to show browser notification
  const showNotification = useCallback((title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'flexflow-notification',
        requireInteraction: false,
      });
    }
  }, []);

  // Function to check if it's time for a meal notification
  const checkMealNotification = useCallback((mealType: 'breakfast' | 'lunch' | 'dinner', mealTime: string) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Check if current time matches meal time (within 1 minute window)
    if (currentTime === mealTime) {
      const mealNames = {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        dinner: 'Dinner',
      };
      
      const lastShownKey = `last-${mealType}-notification`;
      const lastShown = localStorage.getItem(lastShownKey);
      const today = now.toDateString();
      
      // Only show once per day
      if (lastShown !== today) {
        showNotification(
          `${mealNames[mealType]} Time! 🍽️`,
          `It's time for ${mealNames[mealType].toLowerCase()}. Don't forget to log your meal!`
        );
        localStorage.setItem(lastShownKey, today);
      }
    }
  }, [showNotification]);

  // Function to check if workout reminder is needed
  const checkWorkoutReminder = useCallback(async () => {
    if (!preferences?.workoutRemindersEnabled) return;
    
    try {
      const response = await fetch('/api/notification-preferences/workout-reminder-needed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.reminderNeeded) {
        const lastShownKey = 'last-workout-reminder';
        const lastShown = localStorage.getItem(lastShownKey);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // Only show once per hour to avoid spam
        if (!lastShown || now - parseInt(lastShown) > oneHour) {
          showNotification(
            'Workout Reminder 💪',
            "You haven't logged a workout in 24 hours. Time to get moving!"
          );
          localStorage.setItem(lastShownKey, String(now));
          
          // Mark reminder as sent
          await apiRequest('POST', '/api/notification-preferences/workout-reminder-sent', {});
        }
      }
    } catch (error) {
      console.error('Error checking workout reminder:', error);
    }
  }, [preferences?.workoutRemindersEnabled, showNotification]);

  // Set up interval to check for notifications
  useEffect(() => {
    if (!preferences || !preferences.notificationPermissionGranted) return;

    // Check immediately
    if (preferences.workoutRemindersEnabled) {
      checkWorkoutReminder();
    }

    // Set up interval to check every minute
    const interval = setInterval(() => {
      // Check meal notifications
      if (preferences.mealNotificationsEnabled) {
        checkMealNotification('breakfast', preferences.breakfastTime);
        checkMealNotification('lunch', preferences.lunchTime);
        checkMealNotification('dinner', preferences.dinnerTime);
      }

      // Check workout reminder
      if (preferences.workoutRemindersEnabled) {
        checkWorkoutReminder();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [preferences, checkMealNotification, checkWorkoutReminder]);

  return {
    preferences,
    showNotification,
    isEnabled: preferences?.notificationPermissionGranted ?? false,
  };
}
