import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import type { ViewStyle } from 'react-native';

const radii = {
  sm: 8,
  md: 10,
  lg: 10,
  xl: 10,
  pill: 999
} as const;

const shadows = {
  sm: {
    shadowColor: '#0f2a25',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  } as ViewStyle,
  md: {
    shadowColor: '#0f2a25',
    shadowOpacity: 0.11,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  } as ViewStyle
} as const;

export const theme = { colors, spacing, typography, radii, shadows };
