import React, { useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/common/AppButton';
import { useHeaderMotion } from '@/components/common/headerMotion';
import { Gap } from '@/components/layout/Gap';
import { theme } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function PageHeader({ title, subtitle, actionLabel, onActionPress }: Props) {
  const motion = useHeaderMotion();
  const fallback = useRef(new Animated.Value(0)).current;
  const measuredHeightRef = useRef(0);
  const hiddenProgress = motion?.hiddenProgress || fallback;
  const [measuredHeight, setMeasuredHeight] = useState(0);

  const animatedStyle =
    measuredHeight > 0
      ? {
          height: hiddenProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [measuredHeight, 0]
          }),
          opacity: hiddenProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0]
          }),
          transform: [
            {
              translateY: hiddenProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8]
              })
            }
          ]
        }
      : undefined;

  const onMeasure = (event: LayoutChangeEvent) => {
    const next = Math.ceil(event.nativeEvent.layout.height);
    if (next > measuredHeightRef.current) {
      measuredHeightRef.current = next;
      setMeasuredHeight(next);
    }
  };

  return (
    <Animated.View style={[styles.motionWrap, animatedStyle]}>
      <Gap direction="row" justify="space-between" align="center" size="md" style={styles.container} onLayout={onMeasure}>
        <Gap size="xxs" style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </Gap>
        {actionLabel && onActionPress ? (
          <AppButton label={actionLabel} onPress={onActionPress} variant="ghost" size="compact" fullWidth={false} />
        ) : null}
      </Gap>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  motionWrap: {
    overflow: 'hidden'
  },
  container: {
    minWidth: 0
  },
  copy: {
    flex: 1
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.text
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xxs
  }
});
