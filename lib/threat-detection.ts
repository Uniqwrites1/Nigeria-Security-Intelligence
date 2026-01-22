import { ThreatType, SeverityLevel, ConfidenceLevel } from '@/types/security';

const THREAT_KEYWORDS: Record<ThreatType, string[]> = {
  terrorism: [
    'terror', 'terrorist', 'terrorism', 'boko haram', 'iswap', 'islamic state',
    'bomb', 'bombing', 'explosion', 'suicide attack', 'ied', 'improvised explosive',
    'jihadist', 'extremist', 'insurgent attack'
  ],
  banditry: [
    'bandit', 'bandits', 'banditry', 'armed bandits', 'gunmen', 'rustlers',
    'cattle rustling', 'highway robbery', 'armed robbery', 'road attack'
  ],
  kidnapping: [
    'kidnap', 'kidnapping', 'kidnapped', 'abduct', 'abduction', 'abducted',
    'hostage', 'ransom', 'seized', 'snatched', 'missing person'
  ],
  insurgency: [
    'insurgent', 'insurgency', 'rebellion', 'militant group', 'armed group',
    'separatist', 'secession', 'uprising'
  ],
  communal_violence: [
    'communal clash', 'communal violence', 'ethnic clash', 'ethnic violence',
    'herder', 'farmer', 'herdsmen', 'fulani', 'tribal conflict', 'land dispute',
    'religious violence', 'sectarian'
  ],
  militancy: [
    'militant', 'militancy', 'niger delta avengers', 'pipeline vandalism',
    'oil theft', 'illegal refinery', 'creek', 'sea piracy'
  ],
  armed_attack: [
    'armed attack', 'shooting', 'gunfire', 'gun attack', 'assault',
    'attacked', 'ambush', 'raid', 'invasion', 'killed', 'casualties'
  ],
  security_operation: [
    'security operation', 'military operation', 'police operation', 'raid',
    'arrest', 'neutralized', 'clearance operation', 'counter-terrorism',
    'rescue operation', 'security forces', 'troops'
  ],
  pipeline_attack: [
    'pipeline', 'oil facility', 'gas pipeline', 'vandalized', 'sabotage',
    'oil installation', 'petroleum'
  ],
  emerging_threat: [
    'new threat', 'emerging', 'unknown gunmen', 'unidentified', 'mysterious'
  ],
  unknown: []
};

const SEVERITY_KEYWORDS = {
  critical: [
    'massacre', 'mass killing', 'dozens killed', 'many dead', 'death toll',
    'catastrophic', 'major attack', 'large scale'
  ],
  high: [
    'killed', 'death', 'deadly', 'fatal', 'casualties', 'injured',
    'wounded', 'bombing', 'explosion'
  ],
  moderate: [
    'attack', 'violence', 'clash', 'incident', 'injured', 'wounded'
  ],
  low: [
    'threat', 'tension', 'alert', 'warning', 'suspected', 'reported'
  ]
};

export function detectThreatType(text: string): ThreatType[] {
  const lowerText = text.toLowerCase();
  const detectedThreats: ThreatType[] = [];

  for (const [threatType, keywords] of Object.entries(THREAT_KEYWORDS)) {
    if (threatType === 'unknown') continue;

    const hasMatch = keywords.some(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );

    if (hasMatch) {
      detectedThreats.push(threatType as ThreatType);
    }
  }

  if (detectedThreats.length === 0) {
    const securityRelated = isSecurityRelated(text);
    if (securityRelated) {
      detectedThreats.push('armed_attack');
    } else {
      detectedThreats.push('unknown');
    }
  }

  return detectedThreats;
}

export function getPrimaryThreatType(text: string): ThreatType {
  const threats = detectThreatType(text);

  const priority: ThreatType[] = [
    'terrorism',
    'kidnapping',
    'insurgency',
    'banditry',
    'militancy',
    'communal_violence',
    'pipeline_attack',
    'armed_attack',
    'security_operation',
    'emerging_threat',
    'unknown'
  ];

  for (const threat of priority) {
    if (threats.includes(threat)) {
      return threat;
    }
  }

  return 'unknown';
}

export function calculateSeverity(text: string, casualties?: { killed?: number; injured?: number }): SeverityLevel {
  const lowerText = text.toLowerCase();

  if (casualties) {
    const totalKilled = casualties.killed || 0;
    const totalInjured = casualties.injured || 0;

    if (totalKilled >= 20 || (totalKilled >= 10 && totalInjured >= 20)) {
      return 'critical';
    }
    if (totalKilled >= 5 || totalInjured >= 20) {
      return 'high';
    }
    if (totalKilled > 0 || totalInjured >= 5) {
      return 'high';
    }
  }

  for (const keyword of SEVERITY_KEYWORDS.critical) {
    if (lowerText.includes(keyword)) {
      return 'critical';
    }
  }

  for (const keyword of SEVERITY_KEYWORDS.high) {
    if (lowerText.includes(keyword)) {
      return 'high';
    }
  }

  for (const keyword of SEVERITY_KEYWORDS.moderate) {
    if (lowerText.includes(keyword)) {
      return 'moderate';
    }
  }

  return 'low';
}

export function extractCasualties(text: string): { killed?: number; injured?: number; kidnapped?: number } | undefined {
  const casualties: { killed?: number; injured?: number; kidnapped?: number } = {};

  const killedPatterns = [
    /(\d+)\s+(?:people|persons|individuals)?\s*(?:were|was)?\s*killed/i,
    /killed\s+(\d+)/i,
    /(\d+)\s+dead/i,
    /death\s+toll\s+(?:of\s+)?(\d+)/i,
    /(\d+)\s+casualties/i
  ];

  const injuredPatterns = [
    /(\d+)\s+(?:people|persons|individuals)?\s*(?:were|was)?\s*injured/i,
    /injured\s+(\d+)/i,
    /(\d+)\s+wounded/i
  ];

  const kidnappedPatterns = [
    /(\d+)\s+(?:people|persons|individuals)?\s*(?:were|was)?\s*(?:kidnapped|abducted)/i,
    /kidnapped\s+(\d+)/i,
    /abducted\s+(\d+)/i
  ];

  for (const pattern of killedPatterns) {
    const match = text.match(pattern);
    if (match) {
      casualties.killed = parseInt(match[1], 10);
      break;
    }
  }

  for (const pattern of injuredPatterns) {
    const match = text.match(pattern);
    if (match) {
      casualties.injured = parseInt(match[1], 10);
      break;
    }
  }

  for (const pattern of kidnappedPatterns) {
    const match = text.match(pattern);
    if (match) {
      casualties.kidnapped = parseInt(match[1], 10);
      break;
    }
  }

  return Object.keys(casualties).length > 0 ? casualties : undefined;
}

export function isSecurityRelated(text: string): boolean {
  const securityKeywords = [
    'security', 'attack', 'violence', 'crime', 'police', 'military',
    'army', 'troops', 'gunmen', 'armed', 'weapon', 'shooting',
    'killed', 'injured', 'dead', 'assault', 'threat', 'danger'
  ];

  const lowerText = text.toLowerCase();
  return securityKeywords.some(keyword => lowerText.includes(keyword));
}

export function calculateConfidence(
  sourcesCount: number,
  sourceReliability: number,
  hasCasualties: boolean,
  hasLocation: boolean
): ConfidenceLevel {
  let score = 0;

  score += Math.min(sourcesCount * 20, 40);

  score += sourceReliability * 30;

  if (hasCasualties) score += 15;
  if (hasLocation) score += 15;

  if (score >= 85) return 'confirmed';
  if (score >= 65) return 'high';
  if (score >= 45) return 'medium';
  if (score >= 25) return 'low';
  return 'unconfirmed';
}

export function extractTags(text: string, threatType: ThreatType): string[] {
  const tags: string[] = [];

  tags.push(threatType);

  const lowerText = text.toLowerCase();

  if (lowerText.includes('boko haram')) tags.push('Boko Haram');
  if (lowerText.includes('iswap')) tags.push('ISWAP');
  if (lowerText.match(/herder|farmer|herdsmen/)) tags.push('Herder-Farmer');
  if (lowerText.includes('pipeline')) tags.push('Oil Infrastructure');
  if (lowerText.match(/police|military|army|troops/)) tags.push('Security Forces');
  if (lowerText.match(/rescue|freed|released/)) tags.push('Rescue');

  return Array.from(new Set(tags));
}
