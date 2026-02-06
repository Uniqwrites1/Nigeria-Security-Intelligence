'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import useSWR from 'swr';
import { ClusteredIncident } from '@/types/security';
import { formatTime } from '@/lib/formatTime';
import { useToast } from '@/hooks/use-toast';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface NotificationBellProps {
  maxNotifications?: number;
}

export function NotificationBell({ maxNotifications = 5 }: NotificationBellProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<ClusteredIncident[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch latest incidents
  const { data, error, isLoading, mutate } = useSWR('/api/news?limit=10', fetcher, {
    refreshInterval: 60000, // Check every minute
    revalidateOnFocus: true,
  });

  // Initialize with saved read IDs
  useEffect(() => {
    const saved = localStorage.getItem('notification-read-ids');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setReadIds(new Set(parsed));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Check for new notifications
  useEffect(() => {
    if (!data?.data || data.data.length === 0) return;

    const incidents = data.data as ClusteredIncident[];
    const newIncidents = incidents.filter(
      (inc) => !readIds.has(inc.id) && inc.severity !== 'low'
    );

    // Update notifications list
    setNotifications(newIncidents.slice(0, maxNotifications));

    // Calculate unread count
    const newCount = newIncidents.length;
    setUnreadCount(newCount);

    // Play sound for new critical/high incidents
    if (newCount > 0 && readIds.size > 0) {
      const criticalNew = newIncidents.filter(
        (inc) => inc.severity === 'critical' || inc.severity === 'high'
      );
      if (criticalNew.length > 0) {
        playNotificationSound();
      }
    }
  }, [data, readIds, maxNotifications]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Skip sound if it's known to be blocked or missing
      const soundBlocked = localStorage.getItem('notification-sound-blocked');
      if (soundBlocked === 'true') {
        return;
      }
      
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/notification.mp3');
        audioRef.current.volume = 0.5;
      }
      audioRef.current.play().catch((error) => {
        // Mark as blocked to avoid repeated attempts
        console.log('[Notification] Sound blocked or missing:', error.message);
        localStorage.setItem('notification-sound-blocked', 'true');
      });
    } catch {
      // Ignore errors
    }
  };

  // Mark single notification as read
  const markAsRead = (incidentId: string) => {
    const newReadIds = new Set(readIds);
    newReadIds.add(incidentId);
    setReadIds(newReadIds);
    localStorage.setItem('notification-read-ids', JSON.stringify([...newReadIds]));
    setIsOpen(false);
  };

  // Mark all as read
  const markAllAsRead = () => {
    if (notifications.length > 0) {
      const newReadIds = new Set(readIds);
      notifications.forEach((inc) => newReadIds.add(inc.id));
      setReadIds(newReadIds);
      localStorage.setItem('notification-read-ids', JSON.stringify([...newReadIds]));
      setUnreadCount(0);
    }
    setIsOpen(false);
  };

  // Clear all notifications
  const clearNotifications = () => {
    if (notifications.length > 0) {
      const newReadIds = new Set(readIds);
      notifications.forEach((inc) => newReadIds.add(inc.id));
      setReadIds(newReadIds);
      localStorage.setItem('notification-read-ids', JSON.stringify([...newReadIds]));
    }
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
  };

  // Clear all read IDs (reset)
  const clearAllReadIds = () => {
    setReadIds(new Set());
    localStorage.removeItem('notification-read-ids');
  };

  // Refresh notifications
  const refresh = () => {
    mutate();
    toast({
      title: 'Refreshing...',
      description: 'Checking for new incidents',
      duration: 2000,
    });
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'moderate':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Get severity label
  const getSeverityLabel = (severity: string) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        {mounted && <Bell className="w-5 h-5 text-gray-300" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] 
                          bg-red-500 text-white text-xs font-bold rounded-full 
                          px-1.5 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 
                      rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                className="text-xs text-blue-400 hover:text-blue-300"
                title="Refresh notifications"
              >
                Refresh
              </button>
              <button
                onClick={clearAllReadIds}
                className="text-xs text-gray-400 hover:text-gray-300"
                title="Reset all read notifications"
              >
                Reset
              </button>
              <button
                onClick={clearNotifications}
                className="text-xs text-red-400 hover:text-red-300"
                title="Clear current notifications"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                {unreadCount > 0 ? 'No new notifications' : 'All caught up!'}
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {notifications.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3 hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => markAsRead(incident.id)}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 
                                   ${getSeverityColor(incident.severity)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {getSeverityLabel(incident.severity)}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {formatTime(new Date(incident.lastUpdated))}
                          </span>
                        </div>
                        <p className="text-sm text-white mt-0.5 truncate">
                          {incident.title}
                        </p>
                        {incident.state && (
                          <p className="text-xs text-gray-400 mt-1">
                            📍 {incident.state}, Nigeria
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-700 text-center">
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default NotificationBell;

