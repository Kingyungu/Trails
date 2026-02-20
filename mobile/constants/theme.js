export const COLORS = {
  // Brand tint (was primary)
  tint: '#2D6A4F',
  tintLight: '#52B788',

  // iOS System Backgrounds
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',

  // iOS Labels
  label: '#000000',
  secondaryLabel: '#3C3C4399',
  tertiaryLabel: '#3C3C434D',
  placeholderText: '#3C3C434D',

  // iOS Separators
  separator: '#3C3C4329',
  opaqueSeparator: '#C6C6C8',

  // iOS System Colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D55',
  systemTeal: '#5AC8FA',
  systemIndigo: '#5856D6',

  // iOS Grays
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',

  // iOS Fills
  systemFill: '#78788033',
  secondarySystemFill: '#78788029',
  tertiarySystemFill: '#7676801F',
  quaternarySystemFill: '#74748014',

  // Aliases (used by components with generic naming)
  primary: '#2D6A4F',
  primaryLight: '#52B788',
  accent: '#40916C',
  text: '#000000',
  textSecondary: '#3C3C4399',
  textLight: '#8E8E93',
  surface: '#FFFFFF',
  border: '#E5E5EA',
  success: '#34C759',
  error: '#FF3B30',
  star: '#FFCC00',

  // Essentials
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.4)',
};

export const TYPOGRAPHY = {
  largeTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  title1:     { fontSize: 28, fontWeight: '700', letterSpacing: 0.36 },
  title2:     { fontSize: 22, fontWeight: '700', letterSpacing: 0.35 },
  title3:     { fontSize: 20, fontWeight: '600', letterSpacing: 0.38 },
  headline:   { fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
  body:       { fontSize: 17, fontWeight: '400', letterSpacing: -0.41 },
  callout:    { fontSize: 16, fontWeight: '400', letterSpacing: -0.32 },
  subhead:    { fontSize: 15, fontWeight: '400', letterSpacing: -0.24 },
  footnote:   { fontSize: 13, fontWeight: '400', letterSpacing: -0.08 },
  caption1:   { fontSize: 12, fontWeight: '400', letterSpacing: 0 },
  caption2:   { fontSize: 11, fontWeight: '400', letterSpacing: 0.07 },
};

export const DIFFICULTY = {
  1: { label: 'Easy', color: '#34C759' },
  2: { label: 'Moderate', color: '#007AFF' },
  3: { label: 'Challenging', color: '#FF9500' },
  4: { label: 'Hard', color: '#FF3B30' },
  5: { label: 'Expert', color: '#AF52DE' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32,
  xxl: 44,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 13,
  xl: 20,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};
