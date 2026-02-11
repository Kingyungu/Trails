import { create } from 'zustand';
import * as Location from 'expo-location';

const useTrackingStore = create((set, get) => ({
  isTracking: false,
  route: [],
  distance: 0, // km
  duration: 0, // seconds
  startTime: null,
  watchId: null,
  timer: null,

  startTracking: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return false;

    const watchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000,
        distanceInterval: 5,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const state = get();
        const newRoute = [...state.route, { lat: latitude, lng: longitude }];

        let newDistance = state.distance;
        if (state.route.length > 0) {
          const prev = state.route[state.route.length - 1];
          newDistance += haversine(prev.lat, prev.lng, latitude, longitude);
        }

        set({ route: newRoute, distance: newDistance });
      }
    );

    const timer = setInterval(() => {
      set((s) => ({ duration: s.duration + 1 }));
    }, 1000);

    set({
      isTracking: true,
      watchId,
      timer,
      startTime: Date.now(),
      route: [],
      distance: 0,
      duration: 0,
    });
    return true;
  },

  stopTracking: () => {
    const { watchId, timer } = get();
    if (watchId) watchId.remove();
    if (timer) clearInterval(timer);
    set({ isTracking: false, watchId: null, timer: null });
  },

  reset: () => {
    const { watchId, timer } = get();
    if (watchId) watchId.remove();
    if (timer) clearInterval(timer);
    set({
      isTracking: false,
      route: [],
      distance: 0,
      duration: 0,
      startTime: null,
      watchId: null,
      timer: null,
    });
  },
}));

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default useTrackingStore;
