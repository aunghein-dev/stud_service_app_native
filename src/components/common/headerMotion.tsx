import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useUIMotionStore } from '@/store/uiMotionStore';

export type HeaderMotionController = {
  hiddenProgress: Animated.Value;
  onScrollY: (y: number) => void;
  reset: () => void;
};

const HeaderMotionContext = createContext<HeaderMotionController | null>(null);

export function useCreateHeaderMotionController(): HeaderMotionController {
  const hiddenProgress = useRef(new Animated.Value(0)).current;

  // Header motion refs
  const lastY = useRef(0);
  const hidden = useRef(false);
  const direction = useRef<-1 | 0 | 1>(0);
  const travel = useRef(0);
  const hiddenAtY = useRef(0);
  const lastToggleAt = useRef(0);

  // Bottom nav motion refs
  const tabLastY = useRef(0);
  const tabDirection = useRef<-1 | 0 | 1>(0);
  const tabTravel = useRef(0);
  const tabLastToggleAt = useRef(0);

  const animate = useCallback(
    (nextHidden: boolean) => {
      if (hidden.current === nextHidden) {
        return;
      }
      hidden.current = nextHidden;
      Animated.timing(hiddenProgress, {
        toValue: nextHidden ? 1 : 0,
        duration: 180,
        useNativeDriver: false
      }).start();
    },
    [hiddenProgress]
  );

  const onScrollY = useCallback(
    (y: number) => {
      const clampedY = y < 0 ? 0 : y;
      const now = Date.now();

      // Bottom tab bar: scroll up => hide, scroll down => show
      const TAB_HIDE_AFTER_Y = 18;
      const TAB_HIDE_TRAVEL = 12;
      const TAB_SHOW_TRAVEL = 12;
      const TAB_JITTER_DELTA = 0.9;
      const TAB_TOGGLE_COOLDOWN_MS = 220;

      const tabDelta = clampedY - tabLastY.current;
      tabLastY.current = clampedY;

      if (Math.abs(tabDelta) >= TAB_JITTER_DELTA) {
        const nextTabDirection: -1 | 1 = tabDelta > 0 ? 1 : -1;
        if (tabDirection.current !== nextTabDirection) {
          tabDirection.current = nextTabDirection;
          tabTravel.current = 0;
        }
        tabTravel.current += Math.abs(tabDelta);

        const tabState = useUIMotionStore.getState();
        const canTabToggle = now - tabLastToggleAt.current >= TAB_TOGGLE_COOLDOWN_MS;

        if (
          nextTabDirection < 0 &&
          tabState.tabBarVisible &&
          clampedY > TAB_HIDE_AFTER_Y &&
          tabTravel.current >= TAB_HIDE_TRAVEL &&
          canTabToggle
        ) {
          tabState.setTabBarVisible(false);
          tabLastToggleAt.current = now;
          tabTravel.current = 0;
        } else if (
          nextTabDirection > 0 &&
          !tabState.tabBarVisible &&
          tabTravel.current >= TAB_SHOW_TRAVEL &&
          canTabToggle
        ) {
          tabState.setTabBarVisible(true);
          tabLastToggleAt.current = now;
          tabTravel.current = 0;
        }
      }

      if (clampedY <= 2) {
        tabLastY.current = clampedY;
        tabDirection.current = 0;
        tabTravel.current = 0;
      }

      const HIDE_AFTER_Y = 44;
      const HIDE_TRAVEL = 16;
      const SHOW_TRAVEL = 12;
      const SHOW_FROM_HIDE_DELTA = 28;
      const JITTER_DELTA = 0.6;
      const TOGGLE_COOLDOWN_MS = 180;

      const canToggle = now - lastToggleAt.current >= TOGGLE_COOLDOWN_MS;

      if (clampedY <= 2) {
        lastY.current = clampedY;
        direction.current = 0;
        travel.current = 0;
        hiddenAtY.current = 0;
        if (hidden.current) {
          animate(false);
          lastToggleAt.current = now;
        }
        return;
      }

      const delta = clampedY - lastY.current;
      lastY.current = clampedY;

      if (Math.abs(delta) < JITTER_DELTA) {
        return;
      }

      const nextDirection: -1 | 1 = delta > 0 ? 1 : -1;
      if (direction.current !== nextDirection) {
        direction.current = nextDirection;
        travel.current = 0;
      }
      travel.current += Math.abs(delta);

      if (nextDirection > 0) {
        if (!hidden.current && clampedY > HIDE_AFTER_Y && travel.current >= HIDE_TRAVEL && canToggle) {
          animate(true);
          hiddenAtY.current = clampedY;
          lastToggleAt.current = now;
          travel.current = 0;
        }
        return;
      }

      if (!hidden.current) {
        return;
      }

      if (clampedY < 18 && canToggle) {
        animate(false);
        lastToggleAt.current = now;
        travel.current = 0;
        direction.current = 0;
        return;
      }

      const movedUpFromHidePoint = hiddenAtY.current - clampedY;
      if (movedUpFromHidePoint >= SHOW_FROM_HIDE_DELTA && travel.current >= SHOW_TRAVEL && canToggle) {
        animate(false);
        lastToggleAt.current = now;
        travel.current = 0;
        direction.current = 0;
      }
    },
    [animate]
  );

  const reset = useCallback(() => {
    useUIMotionStore.getState().resetTabBarMotion();

    tabLastY.current = 0;
    tabDirection.current = 0;
    tabTravel.current = 0;
    tabLastToggleAt.current = 0;

    hidden.current = false;
    lastY.current = 0;
    direction.current = 0;
    travel.current = 0;
    hiddenAtY.current = 0;
    lastToggleAt.current = 0;
    hiddenProgress.stopAnimation();
    hiddenProgress.setValue(0);
  }, [hiddenProgress]);

  return useMemo(
    () => ({
      hiddenProgress,
      onScrollY,
      reset
    }),
    [hiddenProgress, onScrollY, reset]
  );
}

type ProviderProps = {
  controller: HeaderMotionController;
  children: React.ReactNode;
};

export function HeaderMotionProvider({ controller, children }: ProviderProps) {
  return (
    <HeaderMotionContext.Provider value={controller}>
      {children}
    </HeaderMotionContext.Provider>
  );
}

export function useHeaderMotion() {
  return useContext(HeaderMotionContext);
}

export function useHeaderAutoHideListScroll() {
  const motion = useHeaderMotion();

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      motion?.onScrollY(event.nativeEvent.contentOffset.y);
    },
    [motion]
  );

  return {
    onScroll,
    scrollEventThrottle: 16 as const
  };
}
