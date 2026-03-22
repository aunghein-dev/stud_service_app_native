import React, { useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/common/AppButton';
import { useHeaderMotion } from '@/components/common/headerMotion';
import { theme } from '@/theme';

type Props = {
  limit: number;
  offset: number;
  currentCount: number;
  loading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function PaginationControls({
  limit,
  offset,
  currentCount,
  loading = false,
  onPrevious,
  onNext
}: Props) {
  const motion = useHeaderMotion();
  const measuredHeightRef = useRef(0);
  const fallback = useRef(new Animated.Value(1)).current;
  const progress = motion?.hiddenProgress || fallback;
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const page = Math.floor(offset / limit) + 1;
  const canPrevious = offset > 0 && !loading;
  const canNext = currentCount >= limit && !loading;

  const onMeasure = (event: LayoutChangeEvent) => {
    const next = Math.ceil(event.nativeEvent.layout.height);
    if (next > measuredHeightRef.current) {
      measuredHeightRef.current = next;
      setMeasuredHeight(next);
    }
  };

  const animatedStyle =
    measuredHeight > 0
      ? {
          height: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, measuredHeight]
          }),
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0]
              })
            }
          ]
        }
      : undefined;

  return (
    <Animated.View style={[styles.motionWrap, animatedStyle]}>
      <View style={styles.container} onLayout={onMeasure}>
        <AppButton
          label="Prev"
          size="compact"
          variant="ghost"
          fullWidth={false}
          onPress={onPrevious}
          disabled={!canPrevious}
        />
        <Text style={styles.pageText}>Page {page}</Text>
        <AppButton
          label="Next"
          size="compact"
          variant="secondary"
          fullWidth={false}
          onPress={onNext}
          disabled={!canNext}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  motionWrap: {
    overflow: 'hidden'
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm
  },
  pageText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  }
});
