import { geoArea, geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import L from 'leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldTopology from '@/utils/world-topology';
import { ALPHA2_TO_NUMERIC } from '@/utils/country-codes';

export type MapRegion = 'world' | 'russia';

const RUSSIA_NUMERIC_ID = Number(ALPHA2_TO_NUMERIC.RU);

const topology = worldTopology as unknown as Topology<{ countries: GeometryCollection }>;
const rawGeoJSON = feature(topology, topology.objects.countries) as FeatureCollection<Geometry>;

const rawRussiaFeature = rawGeoJSON.features.find(
  (countryFeature) => Number(countryFeature.id) === RUSSIA_NUMERIC_ID,
);

const NUMERIC_TO_ALPHA2 = Object.entries(ALPHA2_TO_NUMERIC).reduce<Record<string, string>>(
  (acc, [alpha2, numeric]) => {
    acc[numeric] = alpha2;
    return acc;
  },
  {},
);

const coordinateCountryCache = new Map<string, string | undefined>();

function getCoordinateCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)}:${lng.toFixed(3)}`;
}

function findCountryFeatureByCoordinates(lat: number, lng: number): Feature<Geometry> | undefined {
  return rawGeoJSON.features.find((countryFeature) =>
    geoContains(countryFeature as Feature<Geometry>, [lng, lat]),
  );
}

if (!rawRussiaFeature) {
  throw new Error('Russia feature not found in world topology');
}

// WGS84 bounds for viewport fitting.
const RUSSIA_VIEW_BOUNDS = L.latLngBounds(
  [41.2, 19.4],
  [81.9, 169.0],
);

export function isPointInRussia(lat: number, lng: number): boolean {
  return geoContains(rawRussiaFeature as Feature<Geometry>, [lng, lat]);
}

export function getCountryNumericIdByCoordinates(lat: number, lng: number): string | undefined {
  const cacheKey = getCoordinateCacheKey(lat, lng);
  if (coordinateCountryCache.has(cacheKey)) {
    return coordinateCountryCache.get(cacheKey);
  }

  const countryFeature = findCountryFeatureByCoordinates(lat, lng);
  const numericId = countryFeature?.id === undefined || countryFeature?.id === null
    ? undefined
    : countryFeature.id.toString();
  coordinateCountryCache.set(cacheKey, numericId);
  return numericId;
}

export function getCountryAlpha2ByCoordinates(
  lat: number,
  lng: number,
): { code: string; name: string } | undefined {
  const numericId = getCountryNumericIdByCoordinates(lat, lng);
  if (!numericId) return undefined;

  const code = NUMERIC_TO_ALPHA2[numericId];
  if (!code) return undefined;

  const countryFeature = rawGeoJSON.features.find(
    (featureItem) => featureItem.id?.toString() === numericId,
  );
  const fallbackName = (countryFeature?.properties as { name?: string } | null)?.name ?? code;
  return { code, name: fallbackName };
}

let countryAreaByNumericCodeCache: Map<number, number> | undefined;
let totalWorldAreaCache: number | undefined;

export function getWorldCountryAreaStats(): {
  countryAreaByNumericCode: Map<number, number>;
  totalWorldArea: number;
} {
  if (!countryAreaByNumericCodeCache || totalWorldAreaCache === undefined) {
    countryAreaByNumericCodeCache = new Map<number, number>();
    totalWorldAreaCache = 0;

    rawGeoJSON.features.forEach((countryFeature) => {
      const numericCode = Number(countryFeature.id);
      if (!Number.isFinite(numericCode)) return;

      const countryArea = geoArea(countryFeature as Feature<Geometry>);
      countryAreaByNumericCodeCache!.set(numericCode, countryArea);
      totalWorldAreaCache! += countryArea;
    });
  }

  return {
    countryAreaByNumericCode: countryAreaByNumericCodeCache,
    totalWorldArea: totalWorldAreaCache,
  };
}

export function getRussiaBounds(): L.LatLngBounds {
  return RUSSIA_VIEW_BOUNDS;
}

export function normalizeMapRegion(value: unknown): MapRegion {
  if (value === 'russia') return 'russia';
  return 'world';
}
