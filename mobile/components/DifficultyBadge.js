import { View, Text, StyleSheet } from 'react-native';
import { DIFFICULTY, RADIUS, SPACING } from '../constants/theme';

export default function DifficultyBadge({ difficulty, size = 'sm' }) {
  const { label, color } = DIFFICULTY[difficulty] || DIFFICULTY[1];

  return (
    <View style={[styles.badge, { backgroundColor: color }, size === 'lg' && styles.badgeLg]}>
      <Text style={[styles.text, size === 'lg' && styles.textLg]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeLg: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
  },
  text: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textLg: {
    fontSize: 13,
  },
});
