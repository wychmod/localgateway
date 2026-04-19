import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";

type UIState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

export const useUIStore = create<UIState>((set) => ({
  theme: "system",
  setTheme: (theme) => set({ theme })
}));
