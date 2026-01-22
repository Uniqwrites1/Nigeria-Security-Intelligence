import { NIGERIAN_STATES, getStateByName, getRegionForState } from './nigeria-states';
import { Region } from '@/types/security';

const CITY_TO_STATE_MAP: Record<string, string> = {
  'abuja': 'FCT',
  'lagos': 'Lagos',
  'kano': 'Kano',
  'ibadan': 'Oyo',
  'kaduna': 'Kaduna',
  'port harcourt': 'Rivers',
  'benin city': 'Edo',
  'maiduguri': 'Borno',
  'jos': 'Plateau',
  'ilorin': 'Kwara',
  'enugu': 'Enugu',
  'abeokuta': 'Ogun',
  'aba': 'Abia',
  'onitsha': 'Anambra',
  'warri': 'Delta',
  'calabar': 'Cross River',
  'uyo': 'Akwa Ibom',
  'sokoto': 'Sokoto',
  'yola': 'Adamawa',
  'makurdi': 'Benue',
  'damaturu': 'Yobe',
  'gombe': 'Gombe',
  'bauchi': 'Bauchi',
  'minna': 'Niger',
  'dutse': 'Jigawa',
  'katsina': 'Katsina',
  'gusau': 'Zamfara',
  'birnin kebbi': 'Kebbi',
  'lafia': 'Nasarawa',
  'lokoja': 'Kogi',
  'jalingo': 'Taraba',
  'owerri': 'Imo',
  'abakaliki': 'Ebonyi',
  'akure': 'Ondo',
  'osogbo': 'Osun',
  'ado-ekiti': 'Ekiti',
  'yenagoa': 'Bayelsa',
  'asaba': 'Delta',
};

const LGA_PATTERNS: Record<string, string[]> = {
  'Borno': ['gwoza', 'bama', 'damboa', 'chibok', 'dikwa', 'konduga', 'monguno', 'ngala'],
  'Adamawa': ['michika', 'madagali', 'mubi', 'gombi', 'hong'],
  'Yobe': ['geidam', 'gujba', 'gulani', 'buni yadi'],
  'Kaduna': ['birnin gwari', 'giwa', 'igabi', 'chikun', 'kajuru', 'zangon kataf'],
  'Zamfara': ['anka', 'gusau', 'maru', 'bukkuyum', 'zurmi', 'shinkafi'],
  'Katsina': ['jibia', 'batsari', 'safana', 'dandume', 'faskari', 'sabuwa'],
  'Niger': ['shiroro', 'rafi', 'munya', 'mashegu', 'mariga'],
  'Sokoto': ['isa', 'sabon birni', 'rabah', 'goronyo'],
  'Plateau': ['barkin ladi', 'riyom', 'bassa', 'jos north', 'jos south', 'mangu'],
  'Benue': ['logo', 'guma', 'gwer west', 'kwande', 'ushongo'],
  'Taraba': ['takum', 'wukari', 'gassol', 'donga', 'ibi'],
};

export interface GeoTagResult {
  state?: string;
  region?: Region;
  location?: string;
  confidence: number;
}

export function extractLocation(text: string): GeoTagResult {
  const lowerText = text.toLowerCase();

  for (const state of NIGERIAN_STATES) {
    const stateName = state.name.toLowerCase();
    const statePattern = new RegExp(`\\b${stateName}\\s+state\\b`, 'i');
    const bareStatePattern = new RegExp(`\\b${stateName}\\b`, 'i');

    if (statePattern.test(lowerText)) {
      return {
        state: state.name,
        region: state.region,
        location: state.name,
        confidence: 0.95
      };
    }

    if (bareStatePattern.test(lowerText)) {
      const surroundingWords = extractSurroundingContext(text, stateName);
      if (isLikelyStateReference(surroundingWords)) {
        return {
          state: state.name,
          region: state.region,
          location: state.name,
          confidence: 0.85
        };
      }
    }
  }

  for (const [city, state] of Object.entries(CITY_TO_STATE_MAP)) {
    const cityPattern = new RegExp(`\\b${city}\\b`, 'i');
    if (cityPattern.test(lowerText)) {
      const stateObj = getStateByName(state);
      return {
        state: state,
        region: stateObj?.region,
        location: city,
        confidence: 0.80
      };
    }
  }

  for (const [state, lgas] of Object.entries(LGA_PATTERNS)) {
    for (const lga of lgas) {
      const lgaPattern = new RegExp(`\\b${lga}\\b`, 'i');
      if (lgaPattern.test(lowerText)) {
        const stateObj = getStateByName(state);
        return {
          state: state,
          region: stateObj?.region,
          location: lga,
          confidence: 0.75
        };
      }
    }
  }

  const regionMention = extractRegionMention(lowerText);
  if (regionMention) {
    return {
      region: regionMention,
      confidence: 0.50
    };
  }

  return {
    confidence: 0
  };
}

function extractSurroundingContext(text: string, keyword: string): string {
  const index = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (index === -1) return '';

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + keyword.length + 50);

  return text.substring(start, end);
}

function isLikelyStateReference(context: string): boolean {
  const stateIndicators = [
    'state', 'governor', 'capital', 'lga', 'local government',
    'community', 'village', 'town', 'area', 'region'
  ];

  const lowerContext = context.toLowerCase();
  return stateIndicators.some(indicator => lowerContext.includes(indicator));
}

function extractRegionMention(text: string): Region | undefined {
  const regionPatterns: Record<Region, RegExp[]> = {
    'North-East': [/north[\s-]?east/i, /ne\s+nigeria/i, /northeastern/i],
    'North-West': [/north[\s-]?west/i, /nw\s+nigeria/i, /northwestern/i],
    'North-Central': [/north[\s-]?central/i, /nc\s+nigeria/i, /middle\s+belt/i],
    'South-East': [/south[\s-]?east/i, /se\s+nigeria/i, /southeastern/i],
    'South-South': [/south[\s-]?south/i, /ss\s+nigeria/i, /niger\s+delta/i],
    'South-West': [/south[\s-]?west/i, /sw\s+nigeria/i, /southwestern/i],
  };

  for (const [region, patterns] of Object.entries(regionPatterns)) {
    if (patterns.some(pattern => pattern.test(text))) {
      return region as Region;
    }
  }

  return undefined;
}

export function enrichWithGeoData(
  title: string,
  description: string,
  content: string
): GeoTagResult {
  const combinedText = `${title} ${description} ${content}`;

  const titleResult = extractLocation(title);
  if (titleResult.confidence >= 0.75) {
    return titleResult;
  }

  const descResult = extractLocation(description);
  if (descResult.confidence >= 0.75) {
    return descResult;
  }

  const contentResult = extractLocation(content);
  if (contentResult.confidence >= 0.60) {
    return contentResult;
  }

  if (titleResult.confidence > 0) return titleResult;
  if (descResult.confidence > 0) return descResult;
  if (contentResult.confidence > 0) return contentResult;

  return { confidence: 0 };
}
