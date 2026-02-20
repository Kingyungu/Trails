import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../../store/authStore';
import useSubscriptionStore from '../../store/subscriptionStore';
import { uploadImage, getActivityStats } from '../../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, update } = useAuthStore();
  const { subscribed, plan, endDate } = useSubscriptionStore();
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await getActivityStats();
      setStats(data);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const formData = new FormData();
        const uri = result.assets[0].uri;
        formData.append('image', {
          uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });
        const { data } = await uploadImage(formData);
        await update({ avatar: data.url });
      } catch {
        Alert.alert('Upload Failed', 'Could not upload image');
      }
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const formatTotalTime = (seconds) => {
    if (!seconds) return '0h';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <View style={styles.iconCircle}>
          <Ionicons name="person" size={48} color={COLORS.systemGray} />
        </View>
        <Text style={styles.emptyTitle}>Your Profile</Text>
        <Text style={styles.emptyText}>
          Sign in to track trails, write reviews, and save favorites
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.secondaryBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar and name */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrap}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={COLORS.systemGray} />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={14} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.joinDate}>
          Joined {new Date(user.created_at).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Subscription status */}
      {subscribed ? (
        <View style={styles.subActiveBanner}>
          <View style={styles.subActiveLeft}>
            <Ionicons name="star" size={18} color="#F59E0B" />
            <View>
              <Text style={styles.subActiveTitle}>Trails Premium</Text>
              {endDate && (
                <Text style={styles.subActiveExpiry}>
                  Renews {new Date(endDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.subActivePill}>
            <Text style={styles.subActivePillText}>{plan === 'annual' ? 'Annual' : 'Monthly'}</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.subUpgradeBanner} onPress={() => router.push('/subscription')}>
          <View style={styles.subUpgradeLeft}>
            <Ionicons name="star-outline" size={18} color={COLORS.primary} />
            <View>
              <Text style={styles.subUpgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.subUpgradeSub}>Unlock tracking, offline maps & more</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      {/* Hiking Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats?.totalHikes || 0}</Text>
          <Text style={styles.statLabel}>Hikes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats?.totalDistance || 0}</Text>
          <Text style={styles.statLabel}>km Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{formatTotalTime(stats?.totalDuration)}</Text>
          <Text style={styles.statLabel}>Time</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{user.favorites?.length || 0}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>

      {/* Secondary stats row */}
      {stats && stats.totalHikes > 0 && (
        <View style={styles.secondaryStats}>
          <View style={styles.secondaryStatItem}>
            <Ionicons name="trending-up" size={16} color={COLORS.systemOrange} />
            <Text style={styles.secondaryStatText}>
              {stats.totalElevation || 0}m elevation gained
            </Text>
          </View>
          <View style={styles.secondaryStatItem}>
            <Ionicons name="speedometer" size={16} color={COLORS.systemBlue} />
            <Text style={styles.secondaryStatText}>
              {stats.avgSpeed} km/h avg speed
            </Text>
          </View>
          <View style={styles.secondaryStatItem}>
            <Ionicons name="trophy" size={16} color={COLORS.systemYellow} />
            <Text style={styles.secondaryStatText}>
              {stats.longestHike} km longest hike
            </Text>
          </View>
        </View>
      )}

      {/* Menu items */}
      <View style={styles.menuGroup}>
        <MenuItem icon="footsteps" label="Activity History" onPress={() => router.push('/activity-history')} />
        <MenuItem icon="heart" label="Saved Trails" onPress={() => router.push('/favorites')} />
        <MenuItem icon="location" label="Track a Trail" onPress={() => router.push('/tracking')} />
        <MenuItem icon="settings-sharp" label="Settings" onPress={() => router.push('/settings')} />
        <MenuItem icon="information-circle" label="About Trails" last />
      </View>

      {/* Destructive action - separate group */}
      <View style={styles.menuGroup}>
        <MenuItem icon="log-out" label="Sign Out" onPress={handleLogout} danger last />
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress, danger, last }) {
  return (
    <TouchableOpacity style={[styles.menuItem, last && styles.menuItemLast]} onPress={onPress}>
      <Ionicons
        name={icon}
        size={22}
        color={danger ? COLORS.systemRed : COLORS.tint}
      />
      <Text style={[styles.menuLabel, danger && { color: COLORS.systemRed }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.tertiaryLabel} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  content: {
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.systemGray5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
  },
  emptyText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
    textAlign: 'center',
    marginTop: SPACING.sm,
    maxWidth: 260,
  },
  primaryBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.tint,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  primaryBtnText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
  secondaryBtn: {
    marginTop: SPACING.md,
  },
  secondaryBtnText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.tint,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.systemGray5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.tint,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.systemGroupedBackground,
  },
  userName: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
    marginTop: SPACING.md,
  },
  userEmail: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
    marginTop: 2,
  },
  joinDate: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.tertiaryLabel,
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.separator,
  },
  statNum: {
    ...TYPOGRAPHY.title2,
    color: COLORS.tint,
  },
  statLabel: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.secondaryLabel,
    marginTop: 2,
  },
  secondaryStats: {
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  secondaryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  secondaryStatText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
  },
  menuGroup: {
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
    minHeight: 44,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.label,
  },
  subActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF9E7',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  subActiveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  subActiveTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '700',
    color: '#92400E',
  },
  subActiveExpiry: {
    ...TYPOGRAPHY.caption1,
    color: '#B45309',
    marginTop: 1,
  },
  subActivePill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  subActivePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  subUpgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9F4',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  subUpgradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  subUpgradeTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '700',
    color: COLORS.primary,
  },
  subUpgradeSub: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textLight,
    marginTop: 1,
  },
});
