import { create } from 'zustand';
import { getSubscription, initiateSubscription, verifySubscription } from '../services/api';

const useSubscriptionStore = create((set, get) => ({
  subscribed: false,
  plan: null,
  endDate: null,
  loading: true,
  paymentLoading: false,
  error: null,
  checkoutRequestId: null,

  initialize: async () => {
    try {
      set({ loading: true });
      const { data } = await getSubscription();
      set({
        subscribed: data.subscribed,
        plan: data.plan || null,
        endDate: data.endDate || null,
        loading: false,
      });
    } catch {
      set({ subscribed: false, loading: false });
    }
  },

  subscribe: async (phone, plan) => {
    try {
      set({ paymentLoading: true, error: null });
      const { data } = await initiateSubscription(phone, plan);
      set({ checkoutRequestId: data.checkoutRequestId, paymentLoading: false });
      return { success: true, message: data.message, checkoutRequestId: data.checkoutRequestId };
    } catch (err) {
      const message = err.response?.data?.message || 'Payment initiation failed. Please try again.';
      set({ error: message, paymentLoading: false });
      return { success: false, message };
    }
  },

  verify: async (checkoutRequestId) => {
    try {
      const { data } = await verifySubscription(checkoutRequestId);
      if (data.subscribed) {
        await get().initialize();
      }
      return data;
    } catch {
      return { status: 'error' };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useSubscriptionStore;
