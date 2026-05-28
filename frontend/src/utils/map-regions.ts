import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import L from 'leaflet';
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldTopology from '@/utils/world-topology';
import { ALPHA2_TO_NUMERIC } from '@/utils/country-codes';

export type MapRegion = 'world' | 'russia';

const RUSSIA_NUMERIC_ID = Number(ALPHA2_TO_NUMERIC.RU);

function fixRing(ring: Position[]): Position[] {
  let crosses = false;
  for (let i = 1; i < ring.length; i++) {
    if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) {
      crosses = true;
      break;
    }
  }
  if (!crosses) return ring;
  return ring.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat]);
}

function fixAntimeridian(geojson: FeatureCollection<Geometry>): FeatureCollection<Geometry> {
  return {
    ...geojson,
    features: geojson.features.map((feat): Feature<Geometry> => {
      const geom = feat.geometry;
      if (geom.type === 'Polygon') {
        return { ...feat, geometry: { ...geom, coordinates: geom.coordinates.map(fixRing) } };
      }
      if (geom.type === 'MultiPolygon') {
        return {
          ...feat,
          geometry: { ...geom, coordinates: geom.coordinates.map((poly) => poly.map(fixRing)) },
        };
      }
      return feat;
    }),
  };
}

const topology = worldTopology as unknown as Topology<{ countries: GeometryCollection }>;
const rawGeoJSON = feature(topology, topology.objects.countries) as FeatureCollection<Geometry>;
const countriesGeoJSON = fixAntimeridian(rawGeoJSON);

const russiaFeature = countriesGeoJSON.features.find(
  (countryFeature) => Number(countryFeature.id) === RUSSIA_NUMERIC_ID,
);

if (!russiaFeature) {
  throw new Error('Russia feature not found in world topology');
}

let russiaBounds: L.LatLngBounds | null = null;

export function getCountriesGeoJSON(): FeatureCollection<Geometry> {
  return countriesGeoJSON;
}

export function isPointInRussia(lat: number, lng: number): boolean {
  return geoContains(russiaFeature as Feature<Geometry>, [lng, lat]);
}

export function getRussiaBounds(): L.LatLngBounds {
  if (!russiaBounds) {
    russiaBounds = L.geoJSON(russiaFeature as Feature<Geometry>).getBounds();
  }
  return russiaBounds;
}

export function normalizeMapRegion(value: unknown): MapRegion {
  if (value === 'russia') return 'russia';
  return 'world';
}
