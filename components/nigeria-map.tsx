'use client';

import { ClusteredIncident, SeverityLevel } from '@/types/security';
import { NIGERIAN_STATES, REGIONS } from '@/lib/nigeria-states';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NigeriaMapProps {
  incidents: ClusteredIncident[];
  onStateClick?: (state: string) => void;
}

export function NigeriaMap({ incidents, onStateClick }: NigeriaMapProps) {
  const stateIncidentCounts = incidents.reduce((acc, incident) => {
    if (incident.state) {
      acc[incident.state] = (acc[incident.state] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const stateSeverity = incidents.reduce((acc, incident) => {
    if (incident.state) {
      const current = acc[incident.state];
      if (!current || getSeverityValue(incident.severity) > getSeverityValue(current)) {
        acc[incident.state] = incident.severity;
      }
    }
    return acc;
  }, {} as Record<string, SeverityLevel>);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(REGIONS).map(([region, states]) => (
              <div key={region} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{region}</h4>
                <div className="space-y-1">
                  {states.map(state => {
                    const count = stateIncidentCounts[state] || 0;
                    const severity = stateSeverity[state];
                    return (
                      <button
                        key={state}
                        onClick={() => onStateClick?.(state)}
                        aria-label={`${state}${count > 0 ? ` - ${count} incidents` : ' - No incidents'}`}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                          count > 0
                            ? getSeverityColor(severity) + ' hover:brightness-110'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{state}</span>
                          {count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Severity Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <span className="text-sm text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className="text-sm text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-sm text-muted-foreground">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-sm text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-sm text-muted-foreground">No incidents</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Affected States</h4>
            <div className="space-y-2">
              {Object.entries(stateIncidentCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([state, count]) => (
                  <div key={state} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{state}</span>
                    <Badge variant="destructive">{count}</Badge>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function getSeverityColor(severity?: SeverityLevel): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-600 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'moderate':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}

function getSeverityValue(severity: SeverityLevel): number {
  switch (severity) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'moderate':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
}

