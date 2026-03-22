import { create } from 'zustand';

type UIMotionState = {
  tabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
  resetTabBarMotion: () => void;
};

export const useUIMotionStore = create<UIMotionState>((set) => ({
  tabBarVisible: true,
  setTabBarVisible: (visible) => set({ tabBarVisible: visible }),
  resetTabBarMotion: () => set({ tabBarVisible: true })
}));
