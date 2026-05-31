import type { VisitedPlace, VisitedStatistics } from '@/types';
import { detectCountryByPlaceTitle } from '@/config/country-rules';
import { getCountryAlpha2ByCoordinates } from '@/utils/map-regions';

function detectCountry(place: VisitedPlace): { code: string; name: string } {
  const byTitle = detectCountryByPlaceTitle(place.title);
  if (byTitle) return { code: byTitle.code, name: byTitle.name };

  const byCoordinates = getCountryAlpha2ByCoordinates(
    place.coordinates.lat,
    place.coordinates.lng,
  );
  if (byCoordinates) return byCoordinates;

  return { code: 'RU', name: 'Россия' };
}

export function buildStatsFromPlaces(places: VisitedPlace[]): VisitedStatistics {
  const countryByCode = new Map<string, string>();
  const years = new Set<number>();

  places.forEach((place) => {
    const country = detectCountry(place);
    countryByCode.set(country.code, country.name);
    if (place.visitedDate) {
      years.add(new Date(place.visitedDate).getFullYear());
    }
  });

  const countryCodes = Array.from(countryByCode.keys()).sort();
  const countries = countryCodes.map((code) => countryByCode.get(code) || code);

  return {
    totalPlaces: places.length,
    countries,
    countryCodes,
    years: Array.from(years).sort((a, b) => a - b),
  };
}
