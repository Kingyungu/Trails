import { create } from 'zustand';
import api from '../services/api';

const usePoiStore = create((set, get) => ({
  pois: [],
  selectedTypes: [],
  loading: false,
  error: null,

  // Fetch all POIs with optional filters
  fetchPOIs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/pois', { params: filters });
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
      const { data } = await api.get(`/pois/${id}`);
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
      const { data } = await api.get('/pois/types');
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
