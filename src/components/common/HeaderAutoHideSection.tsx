import React, { useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useHeaderMotion } from '@/components/common/headerMotion';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function HeaderAutoHideSection({ children, style }: Props) {
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
    <Animated.View style={[styles.motionWrap, animatedStyle, style]}>
      <View onLayout={onMeasure}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  motionWrap: {
    overflow: 'hidden'
  }
});
