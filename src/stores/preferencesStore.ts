import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type PreferencesState = {
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  toggleHaptics: () => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
      toggleHaptics: () => set({ hapticsEnabled: !get().hapticsEnabled }),
    }),
    {
      name: "plantora-preferences",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Non-reactive read, safe to call inside event handlers and utilities. */
export const hapticsEnabled = () => usePreferencesStore.getState().hapticsEnabled;
