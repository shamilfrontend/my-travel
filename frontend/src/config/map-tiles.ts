import L from 'leaflet';
import type { Layer, Map as LeafletMap, MapOptions, TileLayerOptions } from 'leaflet';

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY as string | undefined;

export const USES_MAPTILER = Boolean(MAPTILER_API_KEY);

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors';

export interface MapTileLayerOptions extends TileLayerOptions {
  onReady?: () => void;
}

interface MapTileLayerSync {
  _update?: () => void;
}

interface MapWithTileLayerCleanup extends LeafletMap {
  __mapTileLayerCleanup?: () => void;
}

let activeMapTilerLayer: MapTileLayerSync | undefined;

function warnMissingMapTilerKey() {
  if (MAPTILER_API_KEY || !import.meta.env.DEV) return;

  console.warn(
    '[map-tiles] VITE_MAPTILER_API_KEY не задан — подписи городов и стран на карте могут быть не на русском. '
    + 'Получите бесплатный ключ на https://cloud.maptiler.com/',
  );
}

function getMapOptionsForTiles(options?: MapOptions): MapOptions {
  if (!MAPTILER_API_KEY) return options ?? {};

  // MapTiler GL canvas uses its own zoom transforms; Leaflet CSS zoom animation desyncs markers.
  return {
    zoomAnimation: false,
    markerZoomAnimation: false,
    fadeAnimation: false,
    zoomSnap: 0.5,
    ...options,
  };
}

function bindMapTilerLayerSync(map: LeafletMap, layer: MapTileLayerSync) {
  activeMapTilerLayer = layer;

  const sync = () => {
    layer._update?.();
  };

  map.on('move zoom zoomend moveend resize viewreset', sync);

  const mapWithCleanup = map as MapWithTileLayerCleanup;
  mapWithCleanup.__mapTileLayerCleanup?.();
  mapWithCleanup.__mapTileLayerCleanup = () => {
    map.off('move zoom zoomend moveend resize viewreset', sync);
    if (activeMapTilerLayer === layer) {
      activeMapTilerLayer = undefined;
    }
  };
}

export function syncMapTileLayer(map: LeafletMap | undefined) {
  if (!map || !USES_MAPTILER) return;
  activeMapTilerLayer?._update?.();
}

export function cleanupMapTileLayer(map: LeafletMap | undefined) {
  if (!map) return;

  const mapWithCleanup = map as MapWithTileLayerCleanup;
  mapWithCleanup.__mapTileLayerCleanup?.();
  mapWithCleanup.__mapTileLayerCleanup = undefined;
  activeMapTilerLayer = undefined;
}

export function createLeafletMap(container: HTMLElement, options?: MapOptions): LeafletMap {
  return L.map(container, getMapOptionsForTiles(options));
}

export async function addMapTileLayer(map: LeafletMap, options?: MapTileLayerOptions): Promise<Layer> {
  const { onReady, ...tileOptions } = options ?? {};

  const invokeReady = () => {
    map.whenReady(() => {
      onReady?.();
    });
  };

  if (MAPTILER_API_KEY) {
    const [{ Language, MaptilerLayer }] = await Promise.all([
      import('@maptiler/leaflet-maptilersdk'),
      import('@maptiler/sdk/dist/maptiler-sdk.css'),
    ]);

    const layer = new MaptilerLayer({
      apiKey: MAPTILER_API_KEY,
      language: Language.RUSSIAN,
    });

    let readyHandled = false;
    const notifyReady = () => {
      if (readyHandled) return;
      readyHandled = true;
      invokeReady();
    };

    layer.on('ready', notifyReady);
    layer.addTo(map);
    bindMapTilerLayerSync(map, layer as MapTileLayerSync);

    // MapTiler SDK mounts asynchronously; guard against a missed `ready` event.
    window.setTimeout(() => {
      if (layer.getMaptilerSDKMap()?.loaded()) {
        notifyReady();
      }
    }, 1000);

    return layer;
  }

  warnMissingMapTilerKey();

  const osmLayer = L.tileLayer(OSM_TILE_URL, {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
    ...tileOptions,
  }).addTo(map);
  invokeReady();
  return osmLayer;
}
