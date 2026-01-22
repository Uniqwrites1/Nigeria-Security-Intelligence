import { SecurityIncident, ClusteredIncident, ConfidenceLevel } from '@/types/security';

export function calculateSimilarity(incident1: SecurityIncident, incident2: SecurityIncident): number {
  let score = 0;

  const title1 = incident1.title.toLowerCase();
  const title2 = incident2.title.toLowerCase();
  const titleSimilarity = calculateTextSimilarity(title1, title2);
  score += titleSimilarity * 0.4;

  if (incident1.state && incident2.state && incident1.state === incident2.state) {
    score += 0.2;
  }

  if (incident1.threatType === incident2.threatType) {
    score += 0.15;
  }

  const time1 = new Date(incident1.publishedAt).getTime();
  const time2 = new Date(incident2.publishedAt).getTime();
  const timeDiff = Math.abs(time1 - time2);
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (hoursDiff <= 24) {
    score += 0.15 * (1 - hoursDiff / 24);
  }

  const desc1 = incident1.description.toLowerCase();
  const desc2 = incident2.description.toLowerCase();
  const descSimilarity = calculateTextSimilarity(desc1, desc2);
  score += descSimilarity * 0.1;

  return Math.min(score, 1.0);
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set(Array.from(words1).filter(w => words2.has(w)));
  const union = new Set([...Array.from(words1), ...Array.from(words2)]);

  return intersection.size / union.size;
}

export function clusterIncidents(incidents: SecurityIncident[], threshold: number = 0.65): ClusteredIncident[] {
  const clusters: Map<string, SecurityIncident[]> = new Map();
  const processed = new Set<string>();

  incidents.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  for (const incident of incidents) {
    if (processed.has(incident.id)) continue;

    let foundCluster = false;

    for (const [clusterId, clusterIncidents] of clusters.entries()) {
      const representative = clusterIncidents[0];
      const similarity = calculateSimilarity(incident, representative);

      if (similarity >= threshold) {
        clusterIncidents.push(incident);
        processed.add(incident.id);
        foundCluster = true;
        break;
      }
    }

    if (!foundCluster) {
      clusters.set(incident.id, [incident]);
      processed.add(incident.id);
    }
  }

  const clusteredIncidents: ClusteredIncident[] = [];

  for (const [clusterId, clusterIncidents] of clusters.entries()) {
    const sortedByConfidence = [...clusterIncidents].sort((a, b) => {
      const confidenceOrder: Record<ConfidenceLevel, number> = {
        'confirmed': 5,
        'high': 4,
        'medium': 3,
        'low': 2,
        'unconfirmed': 1
      };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });

    const primaryIncident = sortedByConfidence[0];

    const sources = new Set(clusterIncidents.map(i => i.source));
    const totalSources = sources.size;

    const avgReliability = calculateClusterConfidence(clusterIncidents);

    const firstReported = clusterIncidents.reduce((earliest, incident) => {
      return new Date(incident.publishedAt) < new Date(earliest)
        ? incident.publishedAt
        : earliest;
    }, clusterIncidents[0].publishedAt);

    const lastUpdated = clusterIncidents.reduce((latest, incident) => {
      return new Date(incident.publishedAt) > new Date(latest)
        ? incident.publishedAt
        : latest;
    }, clusterIncidents[0].publishedAt);

    clusteredIncidents.push({
      id: clusterId,
      incidents: clusterIncidents,
      primaryIncident,
      totalSources,
      confidence: avgReliability,
      firstReported,
      lastUpdated,
      title: primaryIncident.title,
      threatType: primaryIncident.threatType,
      severity: getMostSevere(clusterIncidents),
      state: primaryIncident.state,
      region: primaryIncident.region,
    });
  }

  return clusteredIncidents.sort((a, b) =>
    new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );
}

function calculateClusterConfidence(incidents: SecurityIncident[]): ConfidenceLevel {
  const totalSources = new Set(incidents.map(i => i.source)).size;

  const hasCasualties = incidents.some(i => i.casualties);
  const hasLocation = incidents.some(i => i.state);

  if (totalSources >= 5 && hasCasualties && hasLocation) return 'confirmed';
  if (totalSources >= 3 && (hasCasualties || hasLocation)) return 'high';
  if (totalSources >= 2) return 'medium';
  if (totalSources === 1 && hasCasualties) return 'low';
  return 'unconfirmed';
}

function getMostSevere(incidents: SecurityIncident[]): any {
  const severityOrder: Record<string, number> = {
    'critical': 4,
    'high': 3,
    'moderate': 2,
    'low': 1
  };

  return incidents.reduce((mostSevere, incident) => {
    return severityOrder[incident.severity] > severityOrder[mostSevere.severity]
      ? incident
      : mostSevere;
  }).severity;
}

export function removeDuplicates(incidents: SecurityIncident[]): SecurityIncident[] {
  const seen = new Set<string>();
  const unique: SecurityIncident[] = [];

  for (const incident of incidents) {
    const normalizedUrl = normalizeUrl(incident.url);

    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl);
      unique.push(incident);
    }
  }

  return unique;
}

function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.hostname}${urlObj.pathname}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function mergeIncidentData(incidents: SecurityIncident[]): SecurityIncident {
  if (incidents.length === 0) throw new Error('No incidents to merge');
  if (incidents.length === 1) return incidents[0];

  const primary = incidents[0];

  const casualties = incidents.reduce((acc, incident) => {
    if (!incident.casualties) return acc;

    return {
      killed: Math.max(acc.killed || 0, incident.casualties.killed || 0),
      injured: Math.max(acc.injured || 0, incident.casualties.injured || 0),
      kidnapped: Math.max(acc.kidnapped || 0, incident.casualties.kidnapped || 0),
    };
  }, {} as NonNullable<SecurityIncident['casualties']>);

  const allTags = incidents.flatMap(i => i.tags);
  const uniqueTags = [...new Set(allTags)];

  const bestLocation = incidents.find(i => i.state)?.state || primary.state;
  const bestRegion = incidents.find(i => i.region)?.region || primary.region;

  return {
    ...primary,
    casualties: Object.keys(casualties).length > 0 ? casualties : undefined,
    tags: uniqueTags,
    state: bestLocation,
    region: bestRegion,
  };
}
