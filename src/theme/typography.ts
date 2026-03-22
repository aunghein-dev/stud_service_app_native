import { Platform } from 'react-native';

const families = {
  display: Platform.select({ ios: 'AvenirNext-Heavy', android: 'sans-serif-condensed', default: 'System' }),
  heading: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'sans-serif-medium', default: 'System' }),
  body: Platform.select({ ios: 'AvenirNext-Regular', android: 'sans-serif', default: 'System' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })
} as const;

export const typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    fontFamily: families.display,
    fontWeight: Platform.select({ ios: '800', default: '700' }) as '700' | '800'
  },
  title: {
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.2,
    fontFamily: families.heading,
    fontWeight: '700' as const
  },
  heading: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.1,
    fontFamily: families.heading,
    fontWeight: '700' as const
  },
  subheading: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: families.heading,
    fontWeight: '600' as const
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: families.body,
    fontWeight: '400' as const
  },
  bodyStrong: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: families.heading,
    fontWeight: '600' as const
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.25,
    fontFamily: families.heading,
    fontWeight: '600' as const
  },
  button: {
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.2,
    fontFamily: families.heading,
    fontWeight: '700' as const
  },
  mono: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: families.mono,
    fontWeight: '500' as const
  }
};
