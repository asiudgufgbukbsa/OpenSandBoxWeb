import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { NotificationItem } from '@/api/types';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>([]);

  function addNotification(notification: Omit<NotificationItem, 'id'>) {
    const id = Date.now().toString();
    const newNotification: NotificationItem = {
      ...notification,
      id,
      duration: notification.duration ?? 3000,
    };
    notifications.value.push(newNotification);

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  function success(title: string, message?: string) {
    return addNotification({ type: 'success', title, message });
  }

  function error(title: string, message?: string) {
    return addNotification({ type: 'error', title, message, duration: 5000 });
  }

  function warning(title: string, message?: string) {
    return addNotification({ type: 'warning', title, message });
  }

  function info(title: string, message?: string) {
    return addNotification({ type: 'info', title, message });
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };
});
