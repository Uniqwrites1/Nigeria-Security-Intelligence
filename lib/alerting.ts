import { ClusteredIncident, AlertConfig } from '@/types/security';

export function shouldTriggerAlert(incident: ClusteredIncident, config: AlertConfig): boolean {
  if (!config.enabled) return false;

  if (config.threatTypes.length > 0 && !config.threatTypes.includes(incident.threatType)) {
    return false;
  }

  const severityOrder = { low: 1, moderate: 2, high: 3, critical: 4 };
  const incidentSeverityValue = severityOrder[incident.severity];
  const minSeverityValue = severityOrder[config.minSeverity];

  if (incidentSeverityValue < minSeverityValue) {
    return false;
  }

  if (config.states.length > 0 && incident.state && !config.states.includes(incident.state)) {
    return false;
  }

  return true;
}

export async function sendBrowserNotification(incident: ClusteredIncident): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('Browser notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
  }

  const notification = new Notification('Security Alert', {
    body: `${incident.severity.toUpperCase()}: ${incident.title}`,
    icon: '/icon.png',
    tag: incident.id,
    requireInteraction: incident.severity === 'critical',
    data: {
      url: incident.primaryIncident.url,
    },
  });

  notification.onclick = (event) => {
    event.preventDefault();
    window.open(incident.primaryIncident.url, '_blank');
    notification.close();
  };
}

export async function sendWebhookAlert(
  incident: ClusteredIncident,
  webhookUrl: string
): Promise<void> {
  try {
    const payload = {
      type: 'security_alert',
      severity: incident.severity,
      threat_type: incident.threatType,
      title: incident.title,
      description: incident.primaryIncident.description,
      state: incident.state,
      region: incident.region,
      sources: incident.totalSources,
      url: incident.primaryIncident.url,
      timestamp: incident.lastUpdated,
      casualties: incident.primaryIncident.casualties,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Webhook alert failed:', response.status);
    }
  } catch (error) {
    console.error('Failed to send webhook alert:', error);
  }
}

export async function sendSlackAlert(
  incident: ClusteredIncident,
  slackWebhookUrl: string
): Promise<void> {
  try {
    const severityEmoji = {
      critical: ':rotating_light:',
      high: ':warning:',
      moderate: ':exclamation:',
      low: ':information_source:',
    };

    const payload = {
      text: `${severityEmoji[incident.severity]} *Security Alert*`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${incident.severity.toUpperCase()}: ${incident.threatType}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${incident.title}*\n${incident.primaryIncident.description}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Location:*\n${incident.state || 'Unknown'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Sources:*\n${incident.totalSources}`,
            },
            {
              type: 'mrkdwn',
              text: `*Confidence:*\n${incident.confidence}`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${new Date(incident.lastUpdated).toLocaleString()}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Details',
              },
              url: incident.primaryIncident.url,
            },
          ],
        },
      ],
    };

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Slack alert failed:', response.status);
    }
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

export class AlertManager {
  private config: AlertConfig;
  private seenIncidents: Set<string> = new Set();

  constructor(config: AlertConfig) {
    this.config = config;
  }

  updateConfig(config: AlertConfig) {
    this.config = config;
  }

  async processIncident(incident: ClusteredIncident): Promise<void> {
    if (this.seenIncidents.has(incident.id)) {
      return;
    }

    if (!shouldTriggerAlert(incident, this.config)) {
      return;
    }

    this.seenIncidents.add(incident.id);

    if (this.config.notificationTypes.includes('browser')) {
      await sendBrowserNotification(incident);
    }

    if (this.config.notificationTypes.includes('webhook') && this.config.webhookUrl) {
      await sendWebhookAlert(incident, this.config.webhookUrl);
    }
  }

  clearSeenIncidents() {
    this.seenIncidents.clear();
  }
}

export function saveAlertConfig(config: AlertConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('alertConfig', JSON.stringify(config));
  }
}

export function loadAlertConfig(): AlertConfig | null {
  if (typeof window === 'undefined') return null;

  const saved = localStorage.getItem('alertConfig');
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
