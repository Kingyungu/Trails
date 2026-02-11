import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Change this to your server URL
const API_URL = 'http://100.65.131.253:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const oauthLogin = (provider, providerId, email, name, avatar) =>
  api.post('/auth/oauth', { provider, providerId, email, name, avatar });

export const getMe = () => api.get('/auth/me');

export const updateProfile = (data) => api.put('/auth/me', data);

// Trails
export const getTrails = (params) => api.get('/trails', { params });

export const getTrail = (id) => api.get(`/trails/${id}`);

export const getRegions = () => api.get('/trails/regions');

export const toggleFavorite = (trailId) =>
  api.post(`/trails/${trailId}/favorite`);

export const getFavorites = () => api.get('/trails/user/favorites');

export const getElevationProfile = (trailId) =>
  api.get(`/trails/${trailId}/elevation`);

export const getNearbyTrails = (lat, lng, radius) =>
  api.get('/trails/nearby', { params: { lat, lng, radius } });

// Reviews
export const getReviews = (trailId) => api.get(`/reviews/${trailId}`);

export const addReview = (data) => api.post('/reviews', data);

// Uploads
export const uploadImage = (formData) =>
  api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default api;
