import { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTrailStore from '../../store/trailStore';
import TrailCard from '../../components/TrailCard';
import SearchBar from '../../components/SearchBar';
import NearbyTrails from '../../components/NearbyTrails';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const renderItem = ({ item }) => <TrailCard trail={item} />;
const keyExtractor = (item) => item._id;

export default function HomeScreen() {
  const { trails, regions, loading, filters, fetchTrails, fetchRegions, setFilters } = useTrailStore();

  useEffect(() => {
    fetchTrails(true);
    fetchRegions();
  }, []);

  const handleSearch = useCallback(
    (search) => {
      setFilters({ search });
      fetchTrails(true);
    },
    [setFilters, fetchTrails]
  );

  const handleFilter = useCallback(
    (filter) => {
      setFilters(filter);
      fetchTrails(true);
    },
    [setFilters, fetchTrails]
  );

  const handleRefresh = useCallback(() => {
    fetchTrails(true);
  }, [fetchTrails]);

  // Top rated trails (first 5)
  const topTrails = useMemo(() => trails.slice(0, 5), [trails]);

  const listHeader = useMemo(
    () => (
      <View>
        <SearchBar onSearch={handleSearch} regions={regions} onFilter={handleFilter} currentFilters={filters} />

        {/* Nearby Trails */}
        <View style={{ marginTop: SPACING.lg }}>
          <NearbyTrails />
        </View>

        {/* Featured horizontal scroll */}
        {topTrails.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Rated</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            >
              {topTrails.map((trail) => (
                <TrailCard key={trail._id} trail={trail} compact />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Trails</Text>
        </View>
      </View>
    ),
    [topTrails, regions, filters, handleSearch, handleFilter]
  );

  const listEmpty = useMemo(
    () =>
      loading ? (
        <ActivityIndicator size="large" color={COLORS.tint} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.empty}>
          <Ionicons name="trail-sign-outline" size={48} color={COLORS.systemGray3} />
          <Text style={styles.emptyTitle}>No trails found</Text>
          <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
        </View>
      ),
    [loading]
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={trails}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={6}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          tintColor={COLORS.tint}
          colors={[COLORS.tint]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  list: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
    marginBottom: SPACING.md,
  },
  featuredList: {
    paddingRight: SPACING.md,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
  },
  emptyText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
  },
});
