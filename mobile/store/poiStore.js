import { create } from 'zustand';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://100.65.131.253:5000';

const usePoiStore = create((set, get) => ({
  pois: [],
  selectedTypes: [],
  loading: false,
  error: null,

  // Fetch all POIs with optional filters
  fetchPOIs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();

      if (filters.type) params.append('type', filters.type);
      if (filters.region) params.append('region', filters.region);
      if (filters.search) params.append('search', filters.search);
      if (filters.lat) params.append('lat', filters.lat);
      if (filters.lng) params.append('lng', filters.lng);
      if (filters.radius) params.append('radius', filters.radius);
      if (filters.verified !== undefined) params.append('verified', filters.verified);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await fetch(`${API_URL}/api/pois?${params.toString()}`);

      if (!response.ok) throw new Error('Failed to fetch POIs');

      const data = await response.json();
      set({ pois: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching POIs:', error);
    }
  },

  // Get single POI by ID
  getPOI: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/pois/${id}`);

      if (!response.ok) throw new Error('Failed to fetch POI');

      const data = await response.json();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching POI:', error);
      return null;
    }
  },

  // Get POI types with counts
  getPOITypes: async () => {
    try {
      const response = await fetch(`${API_URL}/api/pois/types`);

      if (!response.ok) throw new Error('Failed to fetch POI types');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching POI types:', error);
      return [];
    }
  },

  // Filter POIs by type
  setSelectedTypes: (types) => {
    set({ selectedTypes: types });
  },

  // Get filtered POIs based on selected types
  getFilteredPOIs: () => {
    const { pois, selectedTypes } = get();
    if (selectedTypes.length === 0) return pois;
    return pois.filter(poi => selectedTypes.includes(poi.type));
  },

  // Clear filters
  clearFilters: () => {
    set({ selectedTypes: [] });
  },

  // Search POIs near location
  searchNearby: async (lat, lng, radius = 50) => {
    return get().fetchPOIs({ lat, lng, radius });
  },
}));

export default usePoiStore;
