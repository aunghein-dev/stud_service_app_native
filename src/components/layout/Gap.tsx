import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { theme } from '@/theme';

type SpaceKey = keyof typeof theme.spacing;

type Props = {
  children: React.ReactNode;
  size?: SpaceKey | number;
  direction?: 'row' | 'column';
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  onLayout?: ViewProps['onLayout'];
};

function resolveGap(size: SpaceKey | number) {
  return typeof size === 'number' ? size : theme.spacing[size];
}

export function Gap({
  children,
  size = 'md',
  direction = 'column',
  align,
  justify,
  wrap = false,
  fill = false,
  style,
  onLayout
}: Props) {
  return (
    <View
      onLayout={onLayout}
      style={[
        styles.base,
        direction === 'row' ? styles.row : styles.column,
        fill && styles.fill,
        {
          gap: resolveGap(size),
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap'
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 0
  },
  column: {
    flexDirection: 'column'
  },
  row: {
    flexDirection: 'row'
  },
  fill: {
    flex: 1
  }
});
