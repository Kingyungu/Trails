import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, DIFFICULTY, SHADOWS } from '../constants/theme';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated', icon: 'star' },
  { value: 'newest', label: 'Newest', icon: 'time' },
  { value: 'name', label: 'Name (A-Z)', icon: 'text' },
  { value: 'difficulty', label: 'Difficulty', icon: 'trending-up' },
  { value: 'distance', label: 'Distance', icon: 'map' },
];

export default function FilterModal({ visible, onClose, onApply, currentFilters = {} }) {
  const [difficulty, setDifficulty] = useState(currentFilters.difficulty || '');
  const [sort, setSort] = useState(currentFilters.sort || 'rating');

  const handleApply = () => {
    onApply({ difficulty, sort });
    onClose();
  };

  const handleClear = () => {
    setDifficulty('');
    setSort('rating');
    onApply({ difficulty: '', sort: 'rating' });
    onClose();
  };

  const toggleDifficulty = (level) => {
    setDifficulty((prev) => (prev === String(level) ? '' : String(level)));
  };

  const hasActiveFilters = difficulty !== '' || sort !== 'rating';

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={handleClear} hitSlop={8}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {/* Difficulty Section */}
            <Text style={styles.sectionLabel}>Difficulty</Text>
            <View style={styles.difficultyRow}>
              {Object.entries(DIFFICULTY).map(([level, { label, color }]) => {
                const isActive = difficulty === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyChip,
                      isActive && { backgroundColor: color, borderColor: color },
                    ]}
                    onPress={() => toggleDifficulty(level)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.difficultyDot,
                        { backgroundColor: isActive ? COLORS.white : color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.difficultyText,
                        isActive && { color: COLORS.white },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sort Section */}
            <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>Sort By</Text>
            <View style={styles.sortList}>
              {SORT_OPTIONS.map(({ value, label, icon }) => {
                const isActive = sort === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.sortItem, isActive && styles.sortItemActive]}
                    onPress={() => setSort(value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={icon}
                      size={20}
                      color={isActive ? COLORS.primary : COLORS.systemGray}
                    />
                    <Text style={[styles.sortText, isActive && styles.sortTextActive]}>
                      {label}
                    </Text>
                    {isActive && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.primary}
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
              <Text style={styles.applyText}>Show Results</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.systemBackground,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '75%',
    paddingBottom: SPACING.xl,
  },
  handleBar: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.systemGray3,
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
  },
  clearText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
    marginBottom: SPACING.sm,
  },
  difficultyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  difficultyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.xs + 2,
  },
  difficultyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  difficultyText: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '600',
    color: COLORS.label,
  },
  sortList: {
    gap: 2,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm + 4,
  },
  sortItemActive: {
    backgroundColor: COLORS.tertiarySystemFill,
  },
  sortText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
    flex: 1,
  },
  sortTextActive: {
    color: COLORS.label,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  applyText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
});
