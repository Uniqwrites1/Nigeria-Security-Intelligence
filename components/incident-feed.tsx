'use client';

import { ClusteredIncident, ThreatType, SeverityLevel } from '@/types/security';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, MapPin, Clock, ExternalLink, Shield } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { formatTime } from '@/lib/formatTime';

interface IncidentFeedProps {
  incidents: ClusteredIncident[];
}

export function IncidentFeed({ incidents }: IncidentFeedProps) {
  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}

function IncidentCard({ incident }: { incident: ClusteredIncident }) {
  const primaryIncident = incident.primaryIncident;

  // Parse the date properly - try multiple formats
  const parseDate = (dateString: string): Date => {
    const date = new Date(dateString);
    if (isValid(date)) {
      return date;
    }
    // If invalid, return current date as fallback
    return new Date();
  };

  const lastUpdatedDate = parseDate(incident.lastUpdated);

  return (
    <Card className="p-6 bg-card border-border hover:border-slate-300 dark:hover:border-slate-600 transition-all">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getSeverityVariant(incident.severity)} className="text-xs">
                {getSeverityLabel(incident.severity)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getThreatTypeLabel(incident.threatType)}
              </Badge>
              {incident.totalSources > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {incident.totalSources} sources
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {incident.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {primaryIncident.description}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {primaryIncident.imageUrl && (
              <img
                src={primaryIncident.imageUrl}
                alt=""
                className="w-24 h-24 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {incident.state && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{incident.state}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground" title={format(lastUpdatedDate, 'PPpp')}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(lastUpdatedDate)}</span>
          </div>

          {primaryIncident.casualties && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>
                {primaryIncident.casualties.killed && `${primaryIncident.casualties.killed} killed`}
                {primaryIncident.casualties.injured && ` ${primaryIncident.casualties.injured} injured`}
                {primaryIncident.casualties.kidnapped && ` ${primaryIncident.casualties.kidnapped} kidnapped`}
              </span>
            </div>
          )}
        </div>

        {primaryIncident.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {primaryIncident.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {incident.incidents.slice(0, 3).map((inc, idx) => (
              <span key={idx} className="text-xs text-muted-foreground/70">
                {inc.source}
              </span>
            ))}
            {incident.incidents.length > 3 && (
              <span className="text-xs text-muted-foreground/70">
                +{incident.incidents.length - 3} more
              </span>
            )}
          </div>

          <a
            href={primaryIncident.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Read more
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </Card>
  );
}

function getSeverityVariant(severity: SeverityLevel): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'destructive';
    case 'moderate':
      return 'default';
    default:
      return 'secondary';
  }
}

function getSeverityLabel(severity: SeverityLevel): string {
  const labels: Record<SeverityLevel, string> = {
    critical: 'Critical - High Severity',
    high: 'High Severity',
    moderate: 'Moderate Severity',
    low: 'Low Severity',
  };
  return labels[severity] || severity;
}

function getThreatTypeLabel(type: ThreatType): string {
  const labels: Record<ThreatType, string> = {
    terrorism: 'Terrorism',
    banditry: 'Banditry',
    kidnapping: 'Kidnapping',
    insurgency: 'Insurgency',
    communal_violence: 'Communal Violence',
    militancy: 'Militancy',
    armed_attack: 'Armed Attack',
    security_operation: 'Security Operation',
    pipeline_attack: 'Pipeline Attack',
    emerging_threat: 'Emerging Threat',
    unknown: 'Unknown',
  };
  return labels[type] || type;
}

