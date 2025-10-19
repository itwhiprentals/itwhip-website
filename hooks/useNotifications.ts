'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string;
  icon: string;
  level: number;
}

interface UseNotificationsOptions {
  userRole?: 'GUEST' | 'HOST' | 'ADMIN';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

async function fetchNotifications(userRole: string): Promise<Notification[]> {
  const response = await fetch(`/api/notifications?userRole=${userRole}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  const data: NotificationsResponse = await response.json();
  return data.success ? data.notifications : [];
}

async function fetchUnreadCount(): Promise<number> {
  const response = await fetch('/api/notifications/unread-count', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch unread count');
  }

  const data: UnreadCountResponse = await response.json();
  return data.success ? data.unreadCount || 0 : 0;
}

async function dismissNotificationApi(notificationId: string): Promise<void> {
  const response = await fetch('/api/notifications/dismiss', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ notificationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to dismiss notification');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to dismiss notification');
  }
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    userRole = 'GUEST',
    autoRefresh = true,
    refreshInterval = 30000,
  } = options;

  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', userRole],
    queryFn: () => fetchNotifications(userRole),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 25000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 25000,
  });

  const dismissMutation = useMutation({
    mutationFn: dismissNotificationApi,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousNotifications = queryClient.getQueryData(['notifications', userRole]);
      const previousCount = queryClient.getQueryData(['notifications', 'unread-count']);

      queryClient.setQueryData(['notifications', userRole], (old: Notification[] = []) =>
        old.filter((n) => n.id !== notificationId)
      );

      queryClient.setQueryData(['notifications', 'unread-count'], (old: number = 0) =>
        Math.max(0, old - 1)
      );

      return { previousNotifications, previousCount };
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', userRole], context.previousNotifications);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count'], context.previousCount);
      }
      console.error('Failed to dismiss notification:', err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    error: error ? String(error) : null,
    refresh: refetch,
    dismissNotification: dismissMutation.mutate,
    dismissing: dismissMutation.isPending ? dismissMutation.variables : null,
  };
}
