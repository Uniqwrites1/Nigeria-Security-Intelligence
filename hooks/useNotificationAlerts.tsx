'use client';

import { useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { ClusteredIncident, AlertConfig, ThreatType, SeverityLevel } from '@/types/security';
import { useToast } from '@/hooks/use-toast';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseNotificationAlertsOptions {
  enabled?: boolean;
  onNewIncident?: (incident: ClusteredIncident) => void;
  alertConfig?: AlertConfig;
  checkInterval?: number;
}

export function useNotificationAlerts({
  enabled = true,
  onNewIncident,
  alertConfig: userAlertConfig,
  checkInterval = 60000, // Check every minute
}: UseNotificationAlertsOptions = {}) {
  const { isPermissionGranted, showNotification, isSupported } = usePushNotifications();
  const { toast } = useToast();
  const lastIncidentIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Default alert config
  const defaultAlertConfig: AlertConfig = {
    enabled: true,
    threatTypes: ['terrorism', 'banditry', 'kidnapping', 'insurgency', 'armed_attack'],
    minSeverity: 'high',
    states: [],
    notificationTypes: ['browser'],
    ...userAlertConfig,
  };

  // Fetch incidents to check for new ones
  const { data, error, isLoading, mutate } = useSWR('/api/news?limit=10', fetcher, {
    refreshInterval: checkInterval,
    revalidateOnFocus: false,
  });

  // Play notification sound
  const playNotificationSound = useCallback((severity: SeverityLevel) => {
    try {
      // Create audio element for notification sound
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/notification.mp3');
        audioRef.current.volume = 0.5;
      }

      // For critical alerts, play a more urgent sound
      if (severity === 'critical') {
        audioRef.current.playbackRate = 1.5;
      } else {
        audioRef.current.playbackRate = 1.0;
      }

      audioRef.current.play().catch(() => {
        // Autoplay might be blocked
        console.log('Notification sound blocked');
      });
    } catch {
      console.log('Could not play notification sound');
    }
  }, []);

  // Check if incident matches alert config
  const matchesAlertConfig = useCallback((incident: ClusteredIncident): boolean => {
    const config = defaultAlertConfig;

    if (!config.enabled) return false;

    // Check threat type
    if (config.threatTypes.length > 0 && !config.threatTypes.includes(incident.threatType)) {
      return false;
    }

    // Check severity
    const severityOrder = { low: 0, moderate: 1, high: 2, critical: 3 };
    const incidentSeverityLevel = severityOrder[incident.severity];
    const minSeverityLevel = severityOrder[config.minSeverity];
    
    if (incidentSeverityLevel < minSeverityLevel) {
      return false;
    }

    // Check state (if specific states are configured)
    if (config.states.length > 0 && incident.state && !config.states.includes(incident.state)) {
      return false;
    }

    return true;
  }, []);

  // Show in-app notification
  const showInAppNotification = useCallback((incident: ClusteredIncident) => {
    const config = defaultAlertConfig;

    toast({
      title: (
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${
            incident.severity === 'critical' ? 'bg-red-500 animate-pulse' :
            incident.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
          }`} />
          <span>{incident.severity.toUpperCase()}: {incident.threatType.replace('_', ' ')}</span>
        </div>
      ),
      description: (
        <div className="mt-2">
          <p className="font-semibold">{incident.title}</p>
          {incident.state && (
            <p className="text-sm text-muted-foreground mt-1">
              📍 {incident.state}, Nigeria
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(incident.lastUpdated).toLocaleString()}
          </p>
        </div>
      ),
      variant: incident.severity === 'critical' ? 'destructive' : 'default',
      duration: incident.severity === 'critical' ? 10000 : 5000,
      action: config.notificationTypes.includes('browser') ? {
        label: 'View Details',
        onClick: () => {
          window.location.href = `/?incident=${incident.id}`;
        },
      } : undefined,
    });
  }, [toast]);

  // Show browser push notification
  const showPushNotification = useCallback(async (incident: ClusteredIncident) => {
    if (!isPermissionGranted || !matchesAlertConfig(incident)) {
      return;
    }

    const severityEmoji = incident.severity === 'critical' ? '🚨' :
                          incident.severity === 'high' ? '⚠️' : 'ℹ️';

    await showNotification(`${severityEmoji} ${incident.severity.toUpperCase()} Alert`, {
      body: `${incident.title}${incident.state ? ` - ${incident.state}` : ''}`,
      tag: `incident-${incident.id}`,
      requireInteraction: incident.severity === 'critical',
      data: {
        url: `/?incident=${incident.id}`,
        incidentId: incident.id,
      },
    });
  }, [isPermissionGranted, showNotification, matchesAlertConfig]);

  // Process new incidents
  const processNewIncidents = useCallback(async (incidents: ClusteredIncident[]) => {
    if (!incidents || incidents.length === 0) return;

    // Get the most recent incident
    const mostRecent = incidents[0];
    
    // Check if this is a new incident
    if (lastIncidentIdRef.current === mostRecent.id) {
      return;
    }

    // Check if it matches alert config
    if (!matchesAlertConfig(mostRecent)) {
      lastIncidentIdRef.current = mostRecent.id;
      return;
    }

    // Process the new incident
    lastIncidentIdRef.current = mostRecent.id;

    // Show in-app notification (works without any backend!)
    showInAppNotification(mostRecent);
    
    // Play sound for high severity and critical (works without backend!)
    if (mostRecent.severity === 'critical' || mostRecent.severity === 'high') {
      playNotificationSound(mostRecent.severity);
    }

    // Show push notification only if permission granted
    if (isPermissionGranted) {
      await showPushNotification(mostRecent);
    }

    // Call callback
    if (onNewIncident) {
      onNewIncident(mostRecent);
    }
  }, [
    matchesAlertConfig, 
    showInAppNotification, 
    showPushNotification, 
    playNotificationSound,
    onNewIncident,
    isPermissionGranted
  ]);

  // Listen for new incidents
  useEffect(() => {
    if (!enabled || !data?.data) return;

    processNewIncidents(data.data);
  }, [enabled, data, processNewIncidents]);

  // Manual refresh
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    isLoading,
    error,
    refresh,
    isSupported,
    hasPermission: isPermissionGranted,
    lastIncidentId: lastIncidentIdRef.current,
  };
}

// Hook for managing alert configuration
export function useAlertConfig() {
  const STORAGE_KEY = 'security-alert-config';

  const getConfig = useCallback((): AlertConfig => {
    if (typeof window === 'undefined') {
      return getDefaultConfig();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...getDefaultConfig(), ...JSON.parse(stored) };
      }
    } catch {
      console.error('Failed to parse alert config');
    }

    return getDefaultConfig();
  }, []);

  const saveConfig = useCallback((config: AlertConfig) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      console.error('Failed to save alert config');
    }
  }, []);

  const resetConfig = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { getConfig, saveConfig, resetConfig };
}

export function getDefaultConfig(): AlertConfig {
  return {
    enabled: true,
    threatTypes: ['terrorism', 'banditry', 'kidnapping', 'insurgency', 'armed_attack'],
    minSeverity: 'high',
    states: [],
    notificationTypes: ['browser'],
  };
}

export default useNotificationAlerts;

