import { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import FilterModal from './FilterModal';

export default function SearchBar({ onSearch, regions = [], onFilter, currentFilters = {} }) {
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const handleSearch = () => {
    onSearch(query);
  };

  const handleRegion = (region) => {
    const next = region === activeRegion ? '' : region;
    setActiveRegion(next);
    onFilter?.({ region: next });
  };

  const handleFilterApply = (filters) => {
    onFilter?.(filters);
  };

  const hasActiveFilters = currentFilters.difficulty !== '' || currentFilters.sort !== 'rating';

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.input}
            placeholder="Search trails..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); onSearch(''); }}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options" size={22} color={COLORS.white} />
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {regions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {regions.map((region) => (
            <TouchableOpacity
              key={region}
              style={[styles.chip, activeRegion === region && styles.chipActive]}
              onPress={() => handleRegion(region)}
            >
              <Text
                style={[styles.chipText, activeRegion === region && styles.chipTextActive]}
              >
                {region}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
        currentFilters={currentFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 50,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  filterBtnActive: {
    backgroundColor: COLORS.tint,
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.systemOrange,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  chips: {
    paddingTop: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
});
