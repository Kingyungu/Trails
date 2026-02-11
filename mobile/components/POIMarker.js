import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

// Get icon and color for POI type
export const getPOIStyle = (type) => {
  const styles = {
    park: { icon: 'leaf', color: '#059669' },
    viewpoint: { icon: 'eye', color: '#0284c7' },
    parking: { icon: 'car', color: '#6b7280' },
    water: { icon: 'water', color: '#0891b2' },
    camping: { icon: 'bed', color: '#ea580c' },
    climbing_wall: { icon: 'trending-up', color: '#7c3aed' },
    waterfall: { icon: 'water-outline', color: '#0ea5e9' },
    cave: { icon: 'moon', color: '#475569' },
    wildlife: { icon: 'paw', color: '#84cc16' },
    picnic: { icon: 'pizza', color: '#f97316' },
    shelter: { icon: 'home', color: '#9333ea' },
    facility: { icon: 'business', color: '#64748b' },
    restaurant: { icon: 'restaurant', color: '#dc2626' },
    trailhead: { icon: 'flag', color: '#16a34a' },
    bridge: { icon: 'git-branch-outline', color: '#0369a1' },
    monument: { icon: 'medal', color: '#b45309' },
    lookout: { icon: 'telescope', color: '#4338ca' },
    lake: { icon: 'contrast-outline', color: '#0891b2' },
    other: { icon: 'location', color: '#6366f1' },
  };

  return styles[type] || styles.other;
};

export default function POIMarker({ type, isActive = false }) {
  const style = getPOIStyle(type);

  return (
    <View
      style={[
        styles.marker,
        { backgroundColor: style.color },
        isActive && styles.markerActive,
      ]}
    >
      <Ionicons name={style.icon} size={isActive ? 20 : 16} color={COLORS.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.md,
  },
  markerActive: {
    transform: [{ scale: 1.2 }],
    borderWidth: 4,
  },
});
