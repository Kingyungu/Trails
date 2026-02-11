import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox from '@rnmapbox/maps';

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
      // Calculate bounding box from trail coordinates
      const lats = trail.coordinates.map((c) => c.lat);
      const lngs = trail.coordinates.map((c) => c.lng);
      const padding = 0.01;
      const bounds = [
        [Math.min(...lngs) - padding, Math.min(...lats) - padding], // SW [lng, lat]
        [Math.max(...lngs) + padding, Math.max(...lats) + padding], // NE [lng, lat]
      ];

      const packName = `trail_${trailId}`;

      // Download Mapbox offline tiles
      await Mapbox.offlineManager.createPack(
        {
          name: packName,
          styleURL: Mapbox.StyleURL.Outdoors,
          bounds,
          minZoom: 10,
          maxZoom: 16,
        },
        (region, status) => {
          const progress = Math.round(
            status.completedResourceCount / Math.max(status.requiredResourceCount, 1) * 100
          );
          set((s) => ({
            downloadProgress: { ...s.downloadProgress, [trailId]: progress },
          }));
        },
        (region, error) => {
          console.error('Offline download error:', error);
        }
      );

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
        mapPackName: packName,
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
      const trailData = offline[trailId];

      if (trailData?.mapPackName) {
        await Mapbox.offlineManager.deletePack(trailData.mapPackName);
      }

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
