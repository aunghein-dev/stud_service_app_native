import React, { useEffect, useRef } from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderMotionProvider, useCreateHeaderMotionController } from '@/components/common/headerMotion';
import { theme } from '@/theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function ScreenContainer({ children, scroll = true, contentStyle }: Props) {
  const headerMotion = useCreateHeaderMotionController();
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 360,
        useNativeDriver: true
      })
    ]).start();
  }, [fade, lift]);

  useEffect(() => {
    headerMotion.reset();
  }, [headerMotion, scroll]);

  const animatedStyle = {
    opacity: fade,
    transform: [{ translateY: lift }]
  };

  if (!scroll) {
    return (
      <HeaderMotionProvider controller={headerMotion}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.backdrop} pointerEvents="none">
            <View style={[styles.orb, styles.orbTop]} />
            <View style={[styles.orb, styles.orbRight]} />
            <View style={[styles.orb, styles.orbBottom]} />
          </View>
          <Animated.View style={[styles.contentStatic, contentStyle, animatedStyle]}>{children}</Animated.View>
        </SafeAreaView>
      </HeaderMotionProvider>
    );
  }

  return (
    <HeaderMotionProvider controller={headerMotion}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.backdrop} pointerEvents="none">
          <View style={[styles.orb, styles.orbTop]} />
          <View style={[styles.orb, styles.orbRight]} />
          <View style={[styles.orb, styles.orbBottom]} />
        </View>
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            headerMotion.onScrollY(event.nativeEvent.contentOffset.y);
          }}
          scrollEventThrottle={16}
        >
          <Animated.View style={animatedStyle}>{children}</Animated.View>
        </ScrollView>
      </SafeAreaView>
    </HeaderMotionProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  orb: {
    position: 'absolute',
    borderRadius: theme.radii.pill
  },
  orbTop: {
    width: 240,
    height: 240,
    backgroundColor: 'rgba(31, 127, 111, 0.07)',
    top: -140,
    left: -70
  },
  orbRight: {
    width: 170,
    height: 170,
    backgroundColor: 'rgba(201, 134, 51, 0.1)',
    top: 100,
    right: -80
  },
  orbBottom: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(99, 127, 87, 0.09)',
    bottom: -120,
    left: -100
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg
  },
  contentStatic: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.lg
  }
});
