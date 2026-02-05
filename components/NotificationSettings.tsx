'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAlertConfig, getDefaultConfig } from '@/hooks/useNotificationAlerts';
import { AlertConfig, ThreatType, SeverityLevel } from '@/types/security';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Bell, 
  BellOff, 
  Shield, 
  AlertTriangle, 
  MapPin,
  Volume2,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const THREAT_TYPES: { value: ThreatType; label: string }[] = [
  { value: 'terrorism', label: 'Terrorism' },
  { value: 'banditry', label: 'Banditry' },
  { value: 'kidnapping', label: 'Kidnapping' },
  { value: 'insurgency', label: 'Insurgency' },
  { value: 'communal_violence', label: 'Communal Violence' },
  { value: 'militancy', label: 'Militancy' },
  { value: 'armed_attack', label: 'Armed Attack' },
  { value: 'security_operation', label: 'Security Operation' },
  { value: 'pipeline_attack', label: 'Pipeline Attack' },
  { value: 'emerging_threat', label: 'Emerging Threat' },
];

const SEVERITY_LEVELS: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'moderate', label: 'Moderate', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
];

export function NotificationSettings() {
  const { isSupported, isPermissionGranted, requestPermission, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
  const { getConfig, saveConfig } = useAlertConfig();
  const [config, setConfig] = useState<AlertConfig>(getDefaultConfig());
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setConfig(getConfig());
  }, [getConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    saveConfig(config);
    
    // If permission not granted, request it
    if (!isPermissionGranted && config.enabled) {
      await requestPermission();
    }
    
    setIsSaving(false);
    setIsOpen(false);
  };

  const handleReset = () => {
    setConfig(getDefaultConfig());
  };

  const toggleThreatType = (threatType: ThreatType) => {
    setConfig(prev => {
      const newTypes = prev.threatTypes.includes(threatType)
        ? prev.threatTypes.filter(t => t !== threatType)
        : [...prev.threatTypes, threatType];
      return { ...prev, threatTypes: newTypes };
    });
  };

  const handleSeverityChange = (value: SeverityLevel) => {
    setConfig(prev => ({ ...prev, minSeverity: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Notification Settings</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-background" suppressHydrationWarning>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure how you receive security alerts and notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive real-time alerts for new incidents
                  </p>
                </div>
                <Switch 
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              {isSupported && (
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label>Permission Status</Label>
                    <div className="flex items-center gap-2">
                      {isPermissionGranted ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-500">Granted</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs text-yellow-500">Not Granted</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!isPermissionGranted ? (
                    <Button size="sm" variant="outline" onClick={requestPermission}>
                      Enable
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={isSubscribed ? unsubscribe : subscribe}
                    >
                      {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Minimum Severity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Severity Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Minimum severity level for notifications
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => handleSeverityChange(level.value)}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg border transition-colors
                      ${config.minSeverity === level.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-accent'
                      }
                    `}
                  >
                    <span className={`w-3 h-3 rounded-full ${level.color}`} />
                    <span className="text-sm">{level.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Threat Types */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Threat Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Select which threat types to receive alerts for
              </p>
              <div className="flex flex-wrap gap-2">
                {THREAT_TYPES.map((threat) => (
                  <Badge
                    key={threat.value}
                    variant={config.threatTypes.includes(threat.value) ? 'default' : 'outline'}
                    className={`
                      cursor-pointer transition-colors
                      ${config.threatTypes.includes(threat.value) 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'hover:bg-accent'
                      }
                    `}
                    onClick={() => toggleThreatType(threat.value)}
                  >
                    {threat.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sound Alert */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Sound Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Play notification sound</Label>
                  <p className="text-xs text-muted-foreground">
                    Sound plays for high and critical severity alerts
                  </p>
                </div>
                <Switch 
                  checked={config.notificationTypes.includes('sound')}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    notificationTypes: checked 
                      ? [...prev.notificationTypes, 'sound']
                      : prev.notificationTypes.filter(t => t !== 'sound')
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-row gap-2 justify-between sm:justify-end">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NotificationSettings;

