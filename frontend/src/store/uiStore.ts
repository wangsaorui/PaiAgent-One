import { create } from 'zustand';

interface UIState {
  isDebugDrawerOpen: boolean;
  toggleDebugDrawer: () => void;
  openDebugDrawer: () => void;
  closeDebugDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isDebugDrawerOpen: false,
  toggleDebugDrawer: () => set((s) => ({ isDebugDrawerOpen: !s.isDebugDrawerOpen })),
  openDebugDrawer: () => set({ isDebugDrawerOpen: true }),
  closeDebugDrawer: () => set({ isDebugDrawerOpen: false }),
}));
