import { useEffect, useRef } from 'react';
import { BujoItem } from '../types';
import { getLocalDateString } from '../utils/plannerUtils';
import { sendNotification, requestNotificationPermission } from '../utils/notificationUtils';

export function useTaskNotifications(items: BujoItem[]) {
  const sentNotifications = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission on mount
    requestNotificationPermission();

    const checkNotifications = () => {
      const today = getLocalDateString();
      const now = new Date();
      const nowTime = now.getTime();

      // Filter tasks for today that have a time and are not completed/cancelled
      const todayTasks = items.filter(item => 
        item.date === today && 
        item.time && 
        item.type === 'task' &&
        item.status !== 'completed' &&
        item.status !== 'cancelled'
      );

      todayTasks.forEach(task => {
        if (!task.time) return;

        const [hours, minutes] = task.time.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);

        const executionTime = task.executionTime || 25;
        const endTime = new Date(startTime.getTime() + executionTime * 60000);

        const startTimeMs = startTime.getTime();
        const endTimeMs = endTime.getTime();

        // 5 minutes before start
        const notifyStartTime = startTimeMs - 5 * 60000;
        // 5 minutes before end
        const notifyEndTime = endTimeMs - 5 * 60000;

        // Start Notification (Window of 1 minute)
        const startId = `start-${task.id}-${task.date}`;
        if (
          !sentNotifications.current.has(startId) &&
          nowTime >= notifyStartTime &&
          nowTime < startTimeMs
        ) {
          sendNotification(`🚀 Tarefa iniciando em 5 min!`, {
            body: task.content,
            tag: startId
          });
          sentNotifications.current.add(startId);
        }

        // End Notification (Window of 1 minute)
        const endId = `end-${task.id}-${task.date}`;
        if (
          !sentNotifications.current.has(endId) &&
          nowTime >= notifyEndTime &&
          nowTime < endTimeMs
        ) {
          sendNotification(`⌛ Tarefa encerrando em 5 min!`, {
            body: task.content,
            tag: endId
          });
          sentNotifications.current.add(endId);
        }
      });

      // Cleanup old notifications from the Set once a new day starts
      // This is a simple way to keep the set small
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        sentNotifications.current.clear();
      }
    };

    // Check every 30 seconds
    const intervalId = setInterval(checkNotifications, 30000);
    
    // Initial check
    checkNotifications();

    return () => clearInterval(intervalId);
  }, [items]);
}
