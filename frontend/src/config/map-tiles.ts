import L from 'leaflet';
import type { Map as LeafletMap, TileLayer, TileLayerOptions } from 'leaflet';

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors';

export function addMapTileLayer(map: LeafletMap, options?: TileLayerOptions): TileLayer {
  return L.tileLayer(OSM_TILE_URL, {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
    ...options,
  }).addTo(map);
}
