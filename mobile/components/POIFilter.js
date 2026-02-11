import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { getPOIStyle } from './POIMarker';

const POI_TYPES = [
  { id: 'park', label: 'Parks' },
  { id: 'viewpoint', label: 'Viewpoints' },
  { id: 'waterfall', label: 'Waterfalls' },
  { id: 'climbing_wall', label: 'Climbing' },
  { id: 'camping', label: 'Camping' },
  { id: 'parking', label: 'Parking' },
  { id: 'water', label: 'Water' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'lake', label: 'Lakes' },
  { id: 'lookout', label: 'Lookouts' },
  { id: 'cave', label: 'Caves' },
  { id: 'restaurant', label: 'Food' },
  { id: 'facility', label: 'Facilities' },
  { id: 'trailhead', label: 'Trailheads' },
];

export default function POIFilter({ selectedTypes = [], onToggleType, style }) {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {POI_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type.id);
          const poiStyle = getPOIStyle(type.id);

          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterChip,
                isSelected && { backgroundColor: poiStyle.color },
              ]}
              onPress={() => onToggleType(type.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={poiStyle.icon}
                size={16}
                color={isSelected ? COLORS.white : poiStyle.color}
              />
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.filterTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.white,
  },
});
