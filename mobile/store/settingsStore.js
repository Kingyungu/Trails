import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'appSettings';

const DEFAULTS = {
  units: 'km',
  mapType: 'standard',
  notifications: true,
};

const useSettingsStore = create((set, get) => ({
  ...DEFAULTS,
  loaded: false,

  initialize: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ ...JSON.parse(raw), loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  setSetting: async (key, value) => {
    set({ [key]: value });
    try {
      const { loaded, ...settings } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // silent
    }
  },

  resetSettings: async () => {
    set({ ...DEFAULTS });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // silent
    }
  },
}));

export default useSettingsStore;
