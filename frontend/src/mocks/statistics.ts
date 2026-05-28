import type { VisitedStatistics } from '@/types';
import { MOCK_CURRENT_USER_ID, MOCK_USER_IDS } from './ids';
import { mockVisitedPlaces } from './visited-places';
import { detectCountryByPlaceTitle } from '@/config/country-rules';

function detectCountry(placeTitle: string): { code: string; name: string } {
  return detectCountryByPlaceTitle(placeTitle)
    || { code: 'RU', name: 'Россия' };
}

function buildStatsFromPlaces(placeUserId?: string): VisitedStatistics {
  const list = placeUserId
    ? mockVisitedPlaces.filter((place) => place.userId === placeUserId)
    : mockVisitedPlaces;

  const countryByCode = new Map<string, string>();
  const years = new Set<number>();

  list.forEach((place) => {
    const country = detectCountry(place.title);
    countryByCode.set(country.code, country.name);
    if (place.visitedDate) {
      years.add(new Date(place.visitedDate).getFullYear());
    }
  });

  const countryCodes = Array.from(countryByCode.keys()).sort();
  const countries = countryCodes.map((code) => countryByCode.get(code) || code);

  return {
    totalPlaces: list.length,
    countries,
    countryCodes,
    years: Array.from(years).sort((a, b) => a - b),
  };
}

const userIds = Array.from(new Set([
  MOCK_CURRENT_USER_ID,
  ...Object.values(MOCK_USER_IDS),
]));

export const mockVisitedStatisticsByUser: Record<string, VisitedStatistics> =
  Object.fromEntries(userIds.map((userId) => [userId, buildStatsFromPlaces(userId)]));

export const mockPublicVisitedStatistics: VisitedStatistics = buildStatsFromPlaces();
