export type ThreatType =
  | 'terrorism'
  | 'banditry'
  | 'kidnapping'
  | 'insurgency'
  | 'communal_violence'
  | 'militancy'
  | 'armed_attack'
  | 'security_operation'
  | 'pipeline_attack'
  | 'emerging_threat'
  | 'unknown';

export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

export type ConfidenceLevel = 'unconfirmed' | 'low' | 'medium' | 'high' | 'confirmed';

export type Region = 'North-Central' | 'North-East' | 'North-West' | 'South-East' | 'South-South' | 'South-West';

export interface NigerianState {
  name: string;
  code: string;
  region: Region;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  publishedAt: string;
  source: string;
  sourceType: 'api' | 'rss' | 'official';
  threatType: ThreatType;
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  state?: string;
  region?: Region;
  location?: string;
  casualties?: {
    killed?: number;
    injured?: number;
    kidnapped?: number;
  };
  imageUrl?: string;
  tags: string[];
  rawData: any;
}

export interface ClusteredIncident {
  id: string;
  incidents: SecurityIncident[];
  primaryIncident: SecurityIncident;
  totalSources: number;
  confidence: ConfidenceLevel;
  firstReported: string;
  lastUpdated: string;
  title: string;
  threatType: ThreatType;
  severity: SeverityLevel;
  state?: string;
  region?: Region;
}

export interface NewsSource {
  name: string;
  type: 'api' | 'rss' | 'official';
  url: string;
  reliability: number;
  enabled: boolean;
}

export interface FilterOptions {
  threatTypes: ThreatType[];
  states: string[];
  regions: Region[];
  severity: SeverityLevel[];
  dateRange: {
    from: Date;
    to: Date;
  };
  sources: string[];
}

export interface AlertConfig {
  enabled: boolean;
  threatTypes: ThreatType[];
  minSeverity: SeverityLevel;
  states: string[];
  notificationTypes: ('browser' | 'email' | 'webhook' | 'sound')[];
  webhookUrl?: string;
}

export interface AggregationStats {
  totalIncidents: number;
  byThreatType: Record<ThreatType, number>;
  byState: Record<string, number>;
  byRegion: Record<Region, number>;
  bySeverity: Record<SeverityLevel, number>;
  sourcesCovered: number;
  lastUpdated: string;
}
