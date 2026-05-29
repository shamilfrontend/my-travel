import L from 'leaflet';
import type { Layer, Map as LeafletMap, TileLayerOptions } from 'leaflet';
import { Language, MaptilerLayer } from '@maptiler/leaflet-maptilersdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY as string | undefined;

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors';

export interface MapTileLayerOptions extends TileLayerOptions {
  onReady?: () => void;
}

interface MaptilerLayerSync extends Layer {
  _update?: () => void;
}

export function syncMapTileLayer(layer: Layer | undefined, map: LeafletMap): void {
  if (!layer) return;

  const maptilerLayer = layer as MaptilerLayerSync;
  if (typeof maptilerLayer._update === 'function') {
    maptilerLayer._update();
  }

  map.invalidateSize({ animate: false });
}

function warnMissingMapTilerKey() {
  if (MAPTILER_API_KEY || !import.meta.env.DEV) return;

  console.warn(
    '[map-tiles] VITE_MAPTILER_API_KEY не задан — подписи городов и стран на карте могут быть не на русском. '
    + 'Получите бесплатный ключ на https://cloud.maptiler.com/',
  );
}

export function addMapTileLayer(map: LeafletMap, options?: MapTileLayerOptions): Layer {
  const { onReady, ...tileOptions } = options ?? {};

  const invokeReady = () => {
    map.whenReady(() => {
      onReady?.();
    });
  };

  if (MAPTILER_API_KEY) {
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
