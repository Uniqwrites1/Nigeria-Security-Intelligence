'use client';

import { useState, useEffect } from 'react';
import { ThreatType, SeverityLevel, Region } from '@/types/security';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { REGIONS } from '@/lib/nigeria-states';
import { X } from 'lucide-react';

interface FilterOptions {
  threatTypes: ThreatType[];
  severities: SeverityLevel[];
  regions: Region[];
  states: string[];
}

interface IncidentFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  stats: {
    total: number;
    filtered: number;
  };
}

export function IncidentFilters({ filters, onFilterChange, stats }: IncidentFiltersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const threatTypes: ThreatType[] = [
    'terrorism',
    'banditry',
    'kidnapping',
    'insurgency',
    'communal_violence',
    'militancy',
    'armed_attack',
    'security_operation',
    'pipeline_attack',
  ];

  const severities: SeverityLevel[] = ['critical', 'high', 'moderate', 'low'];
  const regions = Object.keys(REGIONS) as Region[];

  const toggleThreatType = (type: ThreatType) => {
    const newTypes = filters.threatTypes.includes(type)
      ? filters.threatTypes.filter((t) => t !== type)
      : [...filters.threatTypes, type];
    onFilterChange({ ...filters, threatTypes: newTypes });
  };

  const toggleSeverity = (severity: SeverityLevel) => {
    const newSeverities = filters.severities.includes(severity)
      ? filters.severities.filter((s) => s !== severity)
      : [...filters.severities, severity];
    onFilterChange({ ...filters, severities: newSeverities });
  };

  const toggleRegion = (region: Region) => {
    const newRegions = filters.regions.includes(region)
      ? filters.regions.filter((r) => r !== region)
      : [...filters.regions, region];
    onFilterChange({ ...filters, regions: newRegions });
  };

  const clearFilters = () => {
    onFilterChange({
      threatTypes: [],
      severities: [],
      regions: [],
      states: [],
    });
  };

  const hasActiveFilters =
    filters.threatTypes.length > 0 ||
    filters.severities.length > 0 ||
    filters.regions.length > 0 ||
    filters.states.length > 0;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              {mounted && <X className="w-4 h-4 mr-1" />}
              Clear all
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{stats.filtered}</span> of{' '}
          <span className="text-foreground font-semibold">{stats.total}</span> incidents
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Threat Type</h4>
          <div className="flex flex-wrap gap-2">
            {threatTypes.map((type) => (
              <Badge
                key={type}
                variant={filters.threatTypes.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer hover:brightness-95 transition-all border-border"
                onClick={() => toggleThreatType(type)}
                aria-pressed={filters.threatTypes.includes(type)}
              >
                {getThreatTypeLabel(type)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Severity</h4>
          <div className="flex flex-wrap gap-2">
            {severities.map((severity) => (
              <Badge
                key={severity}
                variant={filters.severities.includes(severity) ? 'destructive' : 'outline'}
                className="cursor-pointer hover:brightness-95 transition-all border-border"
                onClick={() => toggleSeverity(severity)}
                aria-pressed={filters.severities.includes(severity)}
              >
                {getSeverityLabel(severity)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Region</h4>
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => (
              <Badge
                key={region}
                variant={filters.regions.includes(region) ? 'default' : 'outline'}
                className="cursor-pointer hover:brightness-95 transition-all border-border"
                onClick={() => toggleRegion(region)}
                aria-pressed={filters.regions.includes(region)}
              >
                {region}
              </Badge>
            ))}
          </div>
        </div>
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

function getSeverityLabel(severity: SeverityLevel): string {
  const labels: Record<SeverityLevel, string> = {
    critical: 'Critical - High Severity',
    high: 'High Severity',
    moderate: 'Moderate Severity',
    low: 'Low Severity',
  };
  return labels[severity] || severity;
}

