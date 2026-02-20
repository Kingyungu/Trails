import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Text as SvgText,
  G,
  Rect,
  Circle,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getElevationProfile } from '../services/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import useSubscriptionStore from '../store/subscriptionStore';
import PremiumGate from './PremiumGate';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 180;
const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 45 };

export default function ElevationProfile({ trailId }) {
  const { subscribed } = useSubscriptionStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [touchX, setTouchX] = useState(null);

  useEffect(() => {
    if (!subscribed) return;
    loadElevation();
  }, [trailId]);

  const loadElevation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result } = await getElevationProfile(trailId);
      setData(result);
    } catch (err) {
      setError('Could not load elevation data');
    } finally {
      setLoading(false);
    }
  };

  if (!subscribed) {
    return <PremiumGate feature="Elevation Profile" compact />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading elevation data...</Text>
      </View>
    );
  }

  if (error || !data?.profile?.length) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="trending-up" size={24} color={COLORS.textLight} />
        <Text style={styles.errorText}>{error || 'No elevation data available'}</Text>
      </View>
    );
  }

  const { profile, elevation_gain, elevation_loss, elevation_max, elevation_min } = data;
  const chartWidth = SCREEN_WIDTH - SPACING.lg * 2;
  const plotWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const maxDist = profile[profile.length - 1].distance_from_start || 1;
  const elevations = profile.map((p) => p.elevation);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = maxElev - minElev || 1;

  const xScale = (dist) =>
    CHART_PADDING.left + (dist / maxDist) * plotWidth;
  const yScale = (elev) =>
    CHART_PADDING.top + plotHeight - ((elev - minElev) / elevRange) * plotHeight;

  // Build SVG path
  let linePath = `M ${xScale(profile[0].distance_from_start)} ${yScale(profile[0].elevation)}`;
  for (let i = 1; i < profile.length; i++) {
    linePath += ` L ${xScale(profile[i].distance_from_start)} ${yScale(profile[i].elevation)}`;
  }

  // Area fill path
  const areaPath =
    linePath +
    ` L ${xScale(profile[profile.length - 1].distance_from_start)} ${CHART_PADDING.top + plotHeight}` +
    ` L ${xScale(profile[0].distance_from_start)} ${CHART_PADDING.top + plotHeight} Z`;

  // Y-axis labels (4 ticks)
  const yTicks = [];
  for (let i = 0; i <= 3; i++) {
    const elev = minElev + (elevRange * i) / 3;
    yTicks.push({ value: Math.round(elev), y: yScale(elev) });
  }

  // X-axis labels
  const xTicks = [
    { value: '0', x: xScale(0) },
    { value: (maxDist / 2).toFixed(1), x: xScale(maxDist / 2) },
    { value: maxDist.toFixed(1), x: xScale(maxDist) },
  ];

  // Touch crosshair data
  let touchData = null;
  if (touchX !== null) {
    const dist = ((touchX - CHART_PADDING.left) / plotWidth) * maxDist;
    const closest = profile.reduce((prev, curr) =>
      Math.abs(curr.distance_from_start - dist) < Math.abs(prev.distance_from_start - dist)
        ? curr
        : prev
    );
    touchData = {
      x: xScale(closest.distance_from_start),
      y: yScale(closest.elevation),
      elevation: closest.elevation,
      distance: closest.distance_from_start,
    };
  }

  const handleTouch = (e) => {
    const x = e.nativeEvent.locationX;
    if (x >= CHART_PADDING.left && x <= CHART_PADDING.left + plotWidth) {
      setTouchX(x);
    }
  };

  return (
    <View style={styles.container}>
      {/* Chart */}
      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderMove={handleTouch}
        onResponderRelease={() => setTouchX(null)}
      >
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={COLORS.primary} stopOpacity="0.3" />
              <Stop offset="1" stopColor={COLORS.primary} stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <Line
              key={`grid-${i}`}
              x1={CHART_PADDING.left}
              y1={tick.y}
              x2={CHART_PADDING.left + plotWidth}
              y2={tick.y}
              stroke={COLORS.border}
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
          ))}

          {/* Area fill */}
          <Path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <Path
            d={linePath}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Y-axis labels */}
          {yTicks.map((tick, i) => (
            <SvgText
              key={`y-${i}`}
              x={CHART_PADDING.left - 8}
              y={tick.y + 4}
              fontSize={10}
              fill={COLORS.textLight}
              textAnchor="end"
            >
              {tick.value}m
            </SvgText>
          ))}

          {/* X-axis labels */}
          {xTicks.map((tick, i) => (
            <SvgText
              key={`x-${i}`}
              x={tick.x}
              y={CHART_HEIGHT - 8}
              fontSize={10}
              fill={COLORS.textLight}
              textAnchor="middle"
            >
              {tick.value} km
            </SvgText>
          ))}

          {/* Touch crosshair */}
          {touchData && (
            <G>
              <Line
                x1={touchData.x}
                y1={CHART_PADDING.top}
                x2={touchData.x}
                y2={CHART_PADDING.top + plotHeight}
                stroke={COLORS.accent}
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <Circle
                cx={touchData.x}
                cy={touchData.y}
                r={5}
                fill={COLORS.primary}
                stroke={COLORS.white}
                strokeWidth={2}
              />
              <G>
                <Rect
                  x={touchData.x - 40}
                  y={touchData.y - 30}
                  width={80}
                  height={22}
                  rx={4}
                  fill={COLORS.text}
                  opacity={0.85}
                />
                <SvgText
                  x={touchData.x}
                  y={touchData.y - 15}
                  fontSize={10}
                  fill={COLORS.white}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {Math.round(touchData.elevation)}m @ {touchData.distance.toFixed(1)}km
                </SvgText>
              </G>
            </G>
          )}
        </Svg>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatBox
          icon="arrow-up"
          label="Gain"
          value={`${elevation_gain}m`}
          color={COLORS.success}
        />
        <StatBox
          icon="arrow-down"
          label="Loss"
          value={`${elevation_loss}m`}
          color={COLORS.error}
        />
        <StatBox
          icon="caret-up-circle"
          label="Max"
          value={`${elevation_max}m`}
          color={COLORS.primary}
        />
        <StatBox
          icon="caret-down-circle"
          label="Min"
          value={`${elevation_min}m`}
          color={COLORS.accent}
        />
      </View>
    </View>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  statBox: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
