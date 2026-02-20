import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';

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

export const changePassword = (currentPassword, newPassword) =>
  api.put('/auth/password', { currentPassword, newPassword });

export const deleteAccount = () => api.delete('/auth/me');

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (email, code, newPassword) =>
  api.post('/auth/reset-password', { email, code, newPassword });

export const registerPushToken = (token) =>
  api.post('/auth/push-token', { token });

export const removePushToken = (token) =>
  api.delete('/auth/push-token', { data: { token } });

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

// Activities
export const saveActivity = (data) => api.post('/activities', data);

export const getActivities = (params) => api.get('/activities', { params });

export const getActivityStats = () => api.get('/activities/stats');

export const deleteActivity = (id) => api.delete(`/activities/${id}`);

// Condition Reports
export const getTrailConditions = (trailId) => api.get(`/conditions/${trailId}`);

export const reportCondition = (data) => api.post('/conditions', data);

// Uploads
export const uploadImage = (formData) =>
  api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default api;
