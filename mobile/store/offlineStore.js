import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'offlineTrails';

const useOfflineStore = create((set, get) => ({
  offlineTrails: {},
  downloadProgress: {},
  loading: false,

  initialize: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ offlineTrails: JSON.parse(data) });
      }
    } catch {
      // silent
    }
  },

  isOffline: (trailId) => {
    return !!get().offlineTrails[trailId];
  },

  downloadTrail: async (trail) => {
    const trailId = trail._id;
    set((s) => ({
      downloadProgress: { ...s.downloadProgress, [trailId]: 0 },
    }));

    try {
      // Simulate brief download progress for trail data caching
      set((s) => ({
        downloadProgress: { ...s.downloadProgress, [trailId]: 50 },
      }));

      // Cache trail data in AsyncStorage
      const offlineTrailData = {
        trail: {
          _id: trail._id,
          name: trail.name,
          description: trail.description,
          region: trail.region,
          difficulty: trail.difficulty,
          distance_km: trail.distance_km,
          elevation_m: trail.elevation_m,
          duration_hours: trail.duration_hours,
          location: trail.location,
          coordinates: trail.coordinates,
          images: trail.images,
          features: trail.features,
          rating_avg: trail.rating_avg,
          review_count: trail.review_count,
        },
        downloadedAt: new Date().toISOString(),
      };

      const updatedOffline = {
        ...get().offlineTrails,
        [trailId]: offlineTrailData,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOffline));
      set({
        offlineTrails: updatedOffline,
        downloadProgress: { ...get().downloadProgress, [trailId]: 100 },
      });
    } catch (err) {
      console.error('Download trail error:', err);
      set((s) => {
        const dp = { ...s.downloadProgress };
        delete dp[trailId];
        return { downloadProgress: dp };
      });
    }
  },

  removeTrail: async (trailId) => {
    try {
      const offline = get().offlineTrails;
      const updated = { ...offline };
      delete updated[trailId];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ offlineTrails: updated });
    } catch (err) {
      console.error('Remove offline trail error:', err);
    }
  },

  getOfflineTrail: (trailId) => {
    return get().offlineTrails[trailId]?.trail || null;
  },
}));

export default useOfflineStore;
