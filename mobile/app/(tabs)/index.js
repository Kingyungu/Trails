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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useTrailStore from '../../store/trailStore';
import TrailCard from '../../components/TrailCard';
import SearchBar from '../../components/SearchBar';
import NearbyTrails from '../../components/NearbyTrails';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const renderItem = ({ item }) => (
  <View style={styles.cardWrapper}>
    <TrailCard trail={item} />
  </View>
);

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

  const topTrails = useMemo(() => trails.slice(0, 5), [trails]);

  const listHeader = useMemo(
    () => (
      <View>
        {/* Hero Banner */}
        <LinearGradient
          colors={['#1B4332', '#2D6A4F', '#40916C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.heroContent}>
              <View>
                <Text style={styles.heroTitle}>Discover</Text>
                <Text style={styles.heroSub}>Find your next adventure</Text>
              </View>
              <Ionicons name="compass" size={38} color="rgba(255,255,255,0.4)" />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <SearchBar
          onSearch={handleSearch}
          regions={regions}
          onFilter={handleFilter}
          currentFilters={filters}
        />

        {/* Nearby Trails */}
        <View style={styles.nearbySection}>
          <NearbyTrails />
        </View>

        {/* Top Rated horizontal scroll */}
        {topTrails.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated</Text>
              <View style={styles.sectionPill}>
                <Ionicons name="star" size={11} color={COLORS.star} />
                <Text style={styles.sectionPillText}>Best picks</Text>
              </View>
            </View>
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

        {/* All Trails header */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Trails</Text>
            {trails.length > 0 && (
              <Text style={styles.trailCount}>{trails.length} trails</Text>
            )}
          </View>
        </View>
      </View>
    ),
    [topTrails, trails.length, regions, filters, handleSearch, handleFilter]
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
  hero: {
    paddingBottom: SPACING.xl,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  heroTitle: {
    ...TYPOGRAPHY.largeTitle,
    color: COLORS.white,
  },
  heroSub: {
    ...TYPOGRAPHY.subhead,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  nearbySection: {
    marginTop: SPACING.md,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
  },
  sectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.systemGray6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionPillText: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    color: COLORS.systemGray,
  },
  trailCount: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.secondaryLabel,
  },
  featuredList: {
    paddingRight: SPACING.md,
  },
  cardWrapper: {
    marginHorizontal: SPACING.md,
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
