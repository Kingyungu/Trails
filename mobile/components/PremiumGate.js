import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useSubscriptionStore from '../store/subscriptionStore';
import useAuthStore from '../store/authStore';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

export default function PremiumGate({ children, feature = 'This feature', compact = false }) {
  const router = useRouter();
  const { subscribed, loading } = useSubscriptionStore();
  const { user } = useAuthStore();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Ionicons name="lock-closed-outline" size={40} color={COLORS.primary} />
        <Text style={styles.title}>Sign In Required</Text>
        <Text style={styles.subtitle}>{feature} requires an account.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (subscribed) return children;

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={() => router.push('/subscription')}>
        <View style={styles.compactLeft}>
          <View style={styles.compactIcon}>
            <Ionicons name="lock-closed" size={16} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.compactTitle}>{feature}</Text>
            <Text style={styles.compactSub}>Premium feature — tap to unlock</Text>
          </View>
        </View>
        <View style={styles.compactBadge}>
          <Ionicons name="star" size={10} color="#fff" />
          <Text style={styles.compactBadgeText}>PRO</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Ionicons name="star" size={12} color="#fff" />
        <Text style={styles.badgeText}>PREMIUM</Text>
      </View>
      <Ionicons name="lock-closed-outline" size={40} color={COLORS.primary} style={styles.icon} />
      <Text style={styles.title}>{feature}</Text>
      <Text style={styles.subtitle}>
        Upgrade to Trails Premium to unlock GPS tracking, offline maps, activity history, and more.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/subscription')}>
        <Ionicons name="star" size={16} color="#fff" />
        <Text style={styles.btnText}>Upgrade — from KES 299/mo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  icon: {
    marginTop: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9F4',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    marginBottom: SPACING.md,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1F0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    color: COLORS.text,
  },
  compactSub: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textLight,
    marginTop: 1,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  compactBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
