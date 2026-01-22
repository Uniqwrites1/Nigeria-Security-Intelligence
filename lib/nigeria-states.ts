import { NigerianState, Region } from '@/types/security';

export const NIGERIAN_STATES: NigerianState[] = [
  { name: 'Abia', code: 'AB', region: 'South-East', coordinates: { lat: 5.4527, lng: 7.5248 } },
  { name: 'Adamawa', code: 'AD', region: 'North-East', coordinates: { lat: 9.3265, lng: 12.3984 } },
  { name: 'Akwa Ibom', code: 'AK', region: 'South-South', coordinates: { lat: 4.9057, lng: 7.8537 } },
  { name: 'Anambra', code: 'AN', region: 'South-East', coordinates: { lat: 6.2209, lng: 6.9370 } },
  { name: 'Bauchi', code: 'BA', region: 'North-East', coordinates: { lat: 10.3158, lng: 9.8442 } },
  { name: 'Bayelsa', code: 'BY', region: 'South-South', coordinates: { lat: 4.7719, lng: 6.0699 } },
  { name: 'Benue', code: 'BE', region: 'North-Central', coordinates: { lat: 7.3347, lng: 8.7405 } },
  { name: 'Borno', code: 'BO', region: 'North-East', coordinates: { lat: 11.8846, lng: 13.1510 } },
  { name: 'Cross River', code: 'CR', region: 'South-South', coordinates: { lat: 5.8738, lng: 8.5989 } },
  { name: 'Delta', code: 'DE', region: 'South-South', coordinates: { lat: 5.6805, lng: 5.9190 } },
  { name: 'Ebonyi', code: 'EB', region: 'South-East', coordinates: { lat: 6.2649, lng: 8.0137 } },
  { name: 'Edo', code: 'ED', region: 'South-South', coordinates: { lat: 6.6344, lng: 5.9348 } },
  { name: 'Ekiti', code: 'EK', region: 'South-West', coordinates: { lat: 7.7190, lng: 5.3110 } },
  { name: 'Enugu', code: 'EN', region: 'South-East', coordinates: { lat: 6.5314, lng: 7.4405 } },
  { name: 'FCT', code: 'FC', region: 'North-Central', coordinates: { lat: 9.0765, lng: 7.3986 } },
  { name: 'Gombe', code: 'GO', region: 'North-East', coordinates: { lat: 10.2897, lng: 11.1711 } },
  { name: 'Imo', code: 'IM', region: 'South-East', coordinates: { lat: 5.5720, lng: 7.0588 } },
  { name: 'Jigawa', code: 'JI', region: 'North-West', coordinates: { lat: 12.2289, lng: 9.5619 } },
  { name: 'Kaduna', code: 'KD', region: 'North-West', coordinates: { lat: 10.5263, lng: 7.4388 } },
  { name: 'Kano', code: 'KN', region: 'North-West', coordinates: { lat: 11.9967, lng: 8.5921 } },
  { name: 'Katsina', code: 'KT', region: 'North-West', coordinates: { lat: 12.3876, lng: 7.6175 } },
  { name: 'Kebbi', code: 'KE', region: 'North-West', coordinates: { lat: 11.4991, lng: 4.2331 } },
  { name: 'Kogi', code: 'KO', region: 'North-Central', coordinates: { lat: 7.7337, lng: 6.6950 } },
  { name: 'Kwara', code: 'KW', region: 'North-Central', coordinates: { lat: 8.9670, lng: 4.3788 } },
  { name: 'Lagos', code: 'LA', region: 'South-West', coordinates: { lat: 6.5244, lng: 3.3792 } },
  { name: 'Nasarawa', code: 'NA', region: 'North-Central', coordinates: { lat: 8.5402, lng: 8.1133 } },
  { name: 'Niger', code: 'NI', region: 'North-Central', coordinates: { lat: 9.9314, lng: 5.5975 } },
  { name: 'Ogun', code: 'OG', region: 'South-West', coordinates: { lat: 6.9977, lng: 3.4758 } },
  { name: 'Ondo', code: 'ON', region: 'South-West', coordinates: { lat: 7.2506, lng: 5.1950 } },
  { name: 'Osun', code: 'OS', region: 'South-West', coordinates: { lat: 7.5629, lng: 4.5200 } },
  { name: 'Oyo', code: 'OY', region: 'South-West', coordinates: { lat: 8.1574, lng: 3.6106 } },
  { name: 'Plateau', code: 'PL', region: 'North-Central', coordinates: { lat: 9.2182, lng: 9.5179 } },
  { name: 'Rivers', code: 'RI', region: 'South-South', coordinates: { lat: 4.8396, lng: 6.9115 } },
  { name: 'Sokoto', code: 'SO', region: 'North-West', coordinates: { lat: 13.0622, lng: 5.2439 } },
  { name: 'Taraba', code: 'TA', region: 'North-East', coordinates: { lat: 7.9995, lng: 10.7739 } },
  { name: 'Yobe', code: 'YO', region: 'North-East', coordinates: { lat: 12.2938, lng: 11.4400 } },
  { name: 'Zamfara', code: 'ZA', region: 'North-West', coordinates: { lat: 12.1217, lng: 6.2235 } },
];

export const STATE_NAME_MAP = new Map(
  NIGERIAN_STATES.map(state => [state.name.toLowerCase(), state])
);

export const STATE_CODE_MAP = new Map(
  NIGERIAN_STATES.map(state => [state.code.toLowerCase(), state])
);

export const REGIONS: Record<Region, string[]> = {
  'North-Central': ['Benue', 'FCT', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau'],
  'North-East': ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'],
  'North-West': ['Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'],
  'South-East': ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
  'South-South': ['Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers'],
  'South-West': ['Ekiti', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo'],
};

export function getStateByName(name: string): NigerianState | undefined {
  return STATE_NAME_MAP.get(name.toLowerCase());
}

export function getRegionForState(stateName: string): Region | undefined {
  const state = getStateByName(stateName);
  return state?.region;
}
