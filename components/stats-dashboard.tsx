'use client';

import { useState, useEffect } from 'react';
import { ClusteredIncident, ThreatType, SeverityLevel } from '@/types/security';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Users, MapPin, TrendingUp } from 'lucide-react';

interface StatsDashboardProps {
  incidents: ClusteredIncident[];
}

export function StatsDashboard({ incidents }: StatsDashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter((i) => i.severity === 'critical').length;
  const totalCasualties = incidents.reduce((sum, incident) => {
    const casualties = incident.primaryIncident.casualties;
    return sum + (casualties?.killed || 0) + (casualties?.injured || 0);
  }, 0);
  const affectedStates = new Set(incidents.filter((i) => i.state).map((i) => i.state)).size;
  const threatTypeCounts = incidents.reduce((acc, incident) => {
    acc[incident.threatType] = (acc[incident.threatType] || 0) + 1;
    return acc;
  }, {} as Record<ThreatType, number>);
  const topThreat = Object.entries(threatTypeCounts).sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Incidents"
        value={totalIncidents}
        icon={mounted && <AlertTriangle className="w-5 h-5" />}
        trend="+12% from yesterday"
        color="blue"
      />

      <StatCard
        title="Critical Alerts"
        value={criticalIncidents}
        icon={mounted && <AlertTriangle className="w-5 h-5" />}
        trend={`${totalIncidents > 0 ? ((criticalIncidents / totalIncidents) * 100).toFixed(1) : 0}% of total`}
        color="red"
      />

      <StatCard
        title="Total Casualties"
        value={totalCasualties}
        icon={mounted && <Users className="w-5 h-5" />}
        trend="Killed + Injured"
        color="orange"
      />

      <StatCard
        title="Affected States"
        value={affectedStates}
        icon={mounted && <MapPin className="w-5 h-5" />}
        trend={topThreat ? `${getThreatTypeLabel(topThreat[0] as ThreatType)} most common` : 'N/A'}
        color="purple"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  color: 'blue' | 'red' | 'orange' | 'purple';
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
    red: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30',
    orange: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30',
    purple: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30',
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground/70">{trend}</p>
      </div>
    </Card>
  );
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

