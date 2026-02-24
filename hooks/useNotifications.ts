'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  type: string;
  title: string;
  description?: string;
  message?: string;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  iconColor?: string;
  priority?: number;
  level?: number;
  isDismissible?: boolean;
  createdAt?: string;
}

interface UseNotificationsOptions {
  userRole?: 'GUEST' | 'HOST' | 'ADMIN';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface NotificationsResponse {
  success: boolean;
  notifications?: Notification[];
  data?: {
    notifications: Notification[];
    summary?: {
      unreadCount: number;
    };
  };
}

interface UnreadCountResponse {
  success: boolean;
  unreadCount?: number;
  data?: {
    summary?: {
      unreadCount: number;
    };
  };
}

// Route to correct endpoint based on user role
async function fetchNotifications(userRole: string): Promise<Notification[]> {
  // GUEST: booking lifecycle notifications only (for now — account notifications added later)
  let endpoint = '/api/notifications/booking?limit=20';

  if (userRole === 'HOST') {
    endpoint = '/api/host/notifications?limit=10';
  } else if (userRole === 'ADMIN') {
    endpoint = '/api/admin/notifications?limit=10';
  }

  const response = await fetch(endpoint, {
    credentials: 'include',
  });

  // ✅ Return empty array on 401 (token expired) instead of throwing
  // This prevents spamming console with errors and stops unnecessary retries
  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  const data: NotificationsResponse = await response.json();
  
  // ✅ FIXED: Handle nested data structure for HOST/ADMIN
  if (userRole === 'HOST' || userRole === 'ADMIN') {
    if (data.success && data.data?.notifications) {
      // ✅ Map HOST notification structure to bell format
      return data.data.notifications.map((n: any) => ({
        id: n.id,
        type: n.type || 'GENERAL',
        title: n.subject || n.title || 'Notification',
        description: n.message || n.description || '',
        message: n.message,
        actionUrl: n.actionUrl,
        actionLabel: n.actionLabel || 'View',
        icon: mapNotificationTypeToIcon(n.type),
        iconColor: mapNotificationTypeToColor(n.type),
        priority: mapPriorityToLevel(n.priority),
        level: mapPriorityToLevel(n.priority),
        isDismissible: true,
        createdAt: n.createdAt
      }));
    }
    return [];
  }
  
  // ✅ GUEST notifications (flat structure)
  return data.success && data.notifications ? data.notifications : [];
}

// Fetch unread count with role-specific endpoints
async function fetchUnreadCount(userRole: string): Promise<number> {
  // GUEST: booking bell endpoint returns unreadCount directly
  let endpoint = '/api/notifications/booking?limit=1';

  if (userRole === 'HOST') {
    endpoint = '/api/host/notifications?limit=1';
  } else if (userRole === 'ADMIN') {
    endpoint = '/api/admin/notifications?limit=1';
  }

  const response = await fetch(endpoint, {
    credentials: 'include',
  });

  if (!response.ok) {
    return 0;
  }

  const data: UnreadCountResponse = await response.json();
  
  // ✅ FIXED: Extract unread count from nested structure
  if (userRole === 'HOST' || userRole === 'ADMIN') {
    return data.data?.summary?.unreadCount || 0;
  }
  
  return data.success ? (data.unreadCount || 0) : 0;
}

// Dismiss notification with role-specific endpoints
async function dismissNotificationApi(notificationId: string, userRole: string): Promise<void> {
  // GUEST: booking notification dismiss endpoint
  let endpoint = '/api/notifications/booking/read';
  let body: any = { notificationId, action: 'dismiss' };

  if (userRole === 'HOST') {
    endpoint = '/api/host/notifications';
    body = {
      notificationIds: [notificationId],
      action: 'read',
    };
  } else if (userRole === 'ADMIN') {
    endpoint = '/api/admin/notifications';
    body = {
      notificationIds: [notificationId],
      action: 'read',
    };
  }

  const response = await fetch(endpoint, {
    method: userRole === 'HOST' || userRole === 'ADMIN' ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to dismiss notification');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to dismiss notification');
  }
}

// ✅ Helper: Map notification type to icon
function mapNotificationTypeToIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'CLAIM_FILED': 'SHIELD',
    'CLAIM_APPROVED': 'SHIELD',
    'CLAIM_REJECTED': 'ALERT',
    'GUEST_RESPONSE': 'PERSON',
    'GUEST_NO_RESPONSE': 'ALERT',
    'PAYMENT_METHOD_EXPIRING': 'CARD',
    'DOCUMENT_EXPIRING': 'CARD',
    'LICENSE_EXPIRING': 'CARD',
    'INSURANCE_EXPIRING': 'SHIELD',
    'EMERGENCY_CONTACT': 'CALL',
    'PROFILE_UPDATE': 'PERSON',
    'SECURITY_ALERT': 'LOCK',
    'TEST_NOTIFICATION': 'ALERT'
  };
  
  return iconMap[type] || 'ALERT';
}

// ✅ Helper: Map notification type to color
function mapNotificationTypeToColor(type: string): string {
  const colorMap: Record<string, string> = {
    'CLAIM_FILED': 'text-blue-500',
    'CLAIM_APPROVED': 'text-green-500',
    'CLAIM_REJECTED': 'text-red-500',
    'GUEST_RESPONSE': 'text-green-500',
    'GUEST_NO_RESPONSE': 'text-orange-500',
    'PAYMENT_METHOD_EXPIRING': 'text-yellow-500',
    'DOCUMENT_EXPIRING': 'text-yellow-500',
    'LICENSE_EXPIRING': 'text-yellow-500',
    'INSURANCE_EXPIRING': 'text-orange-500',
    'EMERGENCY_CONTACT': 'text-red-500',
    'PROFILE_UPDATE': 'text-blue-500',
    'SECURITY_ALERT': 'text-red-500'
  };
  
  return colorMap[type] || 'text-gray-500';
}

// ✅ Helper: Map priority string to numeric level
function mapPriorityToLevel(priority?: string): number {
  const priorityMap: Record<string, number> = {
    'CRITICAL': 1,
    'HIGH': 2,
    'MEDIUM': 3,
    'LOW': 4
  };
  
  return priorityMap[priority || 'LOW'] || 5;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    userRole = 'GUEST',
    autoRefresh = true,
    refreshInterval = 60000, // ✅ Increased to 60 seconds to reduce server load
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
    queryKey: ['notifications', 'unread-count', userRole],
    queryFn: () => fetchUnreadCount(userRole),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 25000,
  });

  const dismissMutation = useMutation({
    mutationFn: (notificationId: string) => dismissNotificationApi(notificationId, userRole),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousNotifications = queryClient.getQueryData(['notifications', userRole]);
      const previousCount = queryClient.getQueryData(['notifications', 'unread-count', userRole]);

      queryClient.setQueryData(['notifications', userRole], (old: Notification[] = []) =>
        old.filter((n) => n.id !== notificationId)
      );

      queryClient.setQueryData(['notifications', 'unread-count', userRole], (old: number = 0) =>
        Math.max(0, old - 1)
      );

      return { previousNotifications, previousCount };
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', userRole], context.previousNotifications);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count', userRole], context.previousCount);
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