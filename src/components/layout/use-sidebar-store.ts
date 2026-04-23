import { create } from "zustand";

interface SidebarStore {
  collapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  collapsed: false,
  toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (value: boolean) => set({ collapsed: value }),
}));
