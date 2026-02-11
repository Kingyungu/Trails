import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { loginUser, registerUser, getMe, updateProfile, oauthLogin } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        set({ token });
        const { data } = await getMe();
        set({ user: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync('token');
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ error: null });
      const { data } = await loginUser(email, password);
      await SecureStore.setItemAsync('token', data.token);
      set({ user: data.user, token: data.token });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed' });
      return false;
    }
  },

  register: async (name, email, password) => {
    try {
      set({ error: null });
      const { data } = await registerUser(name, email, password);
      await SecureStore.setItemAsync('token', data.token);
      set({ user: data.user, token: data.token });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed' });
      return false;
    }
  },

  socialLogin: async (provider, providerId, email, name, avatar) => {
    try {
      set({ error: null });
      const { data } = await oauthLogin(provider, providerId, email, name, avatar);
      await SecureStore.setItemAsync('token', data.token);
      set({ user: data.user, token: data.token });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Social login failed' });
      return false;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ user: null, token: null });
  },

  update: async (data) => {
    try {
      const { data: user } = await updateProfile(data);
      set({ user });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Update failed' });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
