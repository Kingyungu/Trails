import { create } from 'zustand';
import { getTrails, getTrail, getRegions, toggleFavorite, getFavorites, getNearbyTrails } from '../services/api';

const useTrailStore = create((set, get) => ({
  trails: [],
  featured: [],
  trail: null,
  favorites: [],
  regions: [],
  loading: false,
  page: 1,
  totalPages: 1,
  filters: { search: '', region: '', difficulty: '', sort: 'rating' },
  nearbyAppTrails: [],
  nearbyOsmTrails: [],
  nearbyLoading: false,

  fetchTrails: async (reset = false) => {
    const { filters, page, trails } = get();
    const currentPage = reset ? 1 : page;
    set({ loading: true });

    try {
      const { data } = await getTrails({ ...filters, page: currentPage, limit: 20 });
      set({
        trails: reset ? data.trails : [...trails, ...data.trails],
        page: currentPage + 1,
        totalPages: data.pages,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  fetchTrail: async (id) => {
    set({ loading: true });
    try {
      const { data } = await getTrail(id);
      set({ trail: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchRegions: async () => {
    try {
      const { data } = await getRegions();
      set({ regions: data });
    } catch {
      // silent
    }
  },

  fetchFavorites: async () => {
    try {
      const { data } = await getFavorites();
      set({ favorites: data });
    } catch {
      // silent
    }
  },

  toggleFav: async (trailId) => {
    try {
      const { data } = await toggleFavorite(trailId);
      // Refetch populated trail objects so the favorites list stays correct
      const { data: populated } = await getFavorites();
      set({ favorites: populated });
      return data.isFavorite;
    } catch {
      return false;
    }
  },

  fetchNearbyTrails: async (lat, lng, radius = 50) => {
    set({ nearbyLoading: true });
    try {
      const { data } = await getNearbyTrails(lat, lng, radius);
      set({
        nearbyAppTrails: data.app_trails,
        nearbyOsmTrails: data.osm_trails,
        nearbyLoading: false,
      });
    } catch {
      set({ nearbyLoading: false });
    }
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters }, page: 1 });
  },

  clearTrail: () => set({ trail: null }),
}));

export default useTrailStore;
