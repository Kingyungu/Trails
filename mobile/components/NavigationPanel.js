import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import useNavigationStore from '../store/navigationStore';

function fmtDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export default function NavigationPanel() {
  const {
    guidedTrail,
    progressPercent,
    distanceToEnd,
    isOffRoute,
    deviation,
    nextTurn,
  } = useNavigationStore();

  if (!guidedTrail) return null;

  const turnIcon = nextTurn
    ? nextTurn.direction === 'right'
      ? 'arrow-forward'
      : 'arrow-back'
    : 'arrow-up';

  const turnLabel = nextTurn
    ? `Turn ${nextTurn.direction} in ${fmtDistance(nextTurn.distance)}`
    : 'Continue to end';

  return (
    <View style={styles.wrapper} pointerEvents="none">
      {/* Off-route banner */}
      {isOffRoute && (
        <View style={styles.offRouteBar}>
          <Ionicons name="warning" size={14} color={COLORS.white} />
          <Text style={styles.offRouteText}>
            Off trail — {deviation}m from path
          </Text>
        </View>
      )}

      {/* Main HUD */}
      <View style={styles.panel}>
        <View style={styles.row}>
          {/* Turn arrow */}
          <View style={[styles.iconBox, isOffRoute && styles.iconBoxOff]}>
            <Ionicons name={turnIcon} size={26} color={COLORS.white} />
          </View>

          {/* Turn label + trail name */}
          <View style={styles.textCol}>
            <Text style={styles.turnLabel} numberOfLines={1}>
              {turnLabel}
            </Text>
            <Text style={styles.trailName} numberOfLines={1}>
              {guidedTrail.name}
            </Text>
          </View>

          {/* Distance to end */}
          <Text style={styles.distToEnd}>
            {fmtDistance(distanceToEnd)}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View
            style={[styles.progressFill, { width: `${Math.max(2, progressPercent)}%` }]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {Math.round(progressPercent)}% complete
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  offRouteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.systemOrange,
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
  },
  offRouteText: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '700',
    color: COLORS.white,
  },
  panel: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.tint,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconBoxOff: {
    backgroundColor: COLORS.systemOrange,
  },
  textCol: {
    flex: 1,
  },
  turnLabel: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
  trailName: {
    ...TYPOGRAPHY.footnote,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  distToEnd: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    flexShrink: 0,
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.tintLight,
    borderRadius: 2,
  },
  progressLabel: {
    ...TYPOGRAPHY.caption2,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'right',
  },
});
