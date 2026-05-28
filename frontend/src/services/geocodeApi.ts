import api from './api';

export interface GeocodeSuggestion {
  lat: number;
  lng: number;
  displayName: string;
}

export const geocodeApi = {
  async search(query: string): Promise<GeocodeSuggestion[]> {
    const { data } = await api.get<GeocodeSuggestion[]>('/geocode', { params: { q: query } });
    return data;
  },
};
