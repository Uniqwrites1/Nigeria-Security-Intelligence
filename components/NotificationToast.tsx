'use client';

import { useEffect, useCallback } from 'react';
import { ClusteredIncident, SeverityLevel } from '@/types/security';
import { useToast } from '@/hooks/use-toast';
import { 
  Toast, 
  ToastClose, 
  ToastDescription, 
  ToastProvider, 
  ToastTitle, 
  ToastViewport 
} from '@/components/ui/toast';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  Bell,
  MapPin,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationToastProps {
  incidents?: ClusteredIncident[];
  enabled?: boolean;
  maxVisible?: number;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export function NotificationToast({
  incidents = [],
  enabled = true,
  maxVisible = 3,
  position = 'bottom-right',
}: NotificationToastProps) {
  const { toasts, dismiss, toast: showToast } = useToast();

  const getSeverityIcon = useCallback((severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'moderate':
        return <Info className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  }, []);

  const getSeverityStyles = useCallback((severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20',
          icon: 'text-red-500',
          badge: 'bg-red-500 text-white',
        };
      case 'high':
        return {
          container: 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20',
          icon: 'text-orange-500',
          badge: 'bg-orange-500 text-white',
        };
      case 'moderate':
        return {
          container: 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
          icon: 'text-yellow-500',
          badge: 'bg-yellow-500 text-black',
        };
      default:
        return {
          container: 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
          icon: 'text-blue-500',
          badge: 'bg-blue-500 text-white',
        };
    }
  }, []);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, []);

  // Show toast when new incidents arrive
  useEffect(() => {
    if (!enabled || incidents.length === 0) return;

    // Get new incidents (that haven't been shown)
    const newIncidents = incidents.slice(0, maxVisible);

    newIncidents.forEach((incident, index) => {
      // Add a small delay for each notification
      setTimeout(() => {
        const styles = getSeverityStyles(incident.severity);
        
        showToast({
          title: (
            <div className="flex items-center gap-2">
              <span className={cn('flex items-center gap-1', styles.icon)}>
                {getSeverityIcon(incident.severity)}
              </span>
              <span className="uppercase text-xs font-bold tracking-wider">
                {incident.severity}
              </span>
              <Badge className={cn('text-xs', styles.badge)}>
                {incident.threatType.replace('_', ' ')}
              </Badge>
            </div>
          ),
          description: (
            <div className="mt-2 space-y-2">
              <p className="font-medium text-foreground line-clamp-2">
                {incident.title}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {incident.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {incident.state}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(incident.lastUpdated)}
                </span>
              </div>
            </div>
          ),
          variant: incident.severity === 'critical' ? 'destructive' : 'default',
          duration: incident.severity === 'critical' ? 10000 : 6000,
        });
      }, index * 500);
    });
  }, [incidents, enabled, maxVisible, showToast, getSeverityStyles, getSeverityIcon, formatTime]);

  const positionClasses = {
    'top-right': 'fixed top-0 right-0',
    'bottom-right': 'fixed bottom-0 right-0',
    'top-left': 'fixed top-0 left-0',
    'bottom-left': 'fixed bottom-0 left-0',
  };

  return (
    <ToastProvider>
      <div className={cn('z-[100] m-4 space-y-2', positionClasses[position])}>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            {...toast}
            className={cn(
              'w-[350px] shadow-lg',
              // Add custom styling for severity
              toast.variant === 'destructive' && 'border-l-4 border-l-red-500'
            )}
          >
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
            {toast.action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}

// Badge helper component
function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      className
    )}>
      {children}
    </span>
  );
}

export default NotificationToast;

