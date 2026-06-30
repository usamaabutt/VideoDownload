import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useUserStore = create(
  persist(
    (set) => ({
      hydrated: false,
      hasCompletedOnboarding: false,
      name: '',
      email: '',
      interests: [],

      setProfile: (name, email) => set({ name: name.trim(), email: email.trim() }),
      setInterests: (interests) => set({ interests }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      signOut: () =>
        set({
          hasCompletedOnboarding: false,
          name: '',
          email: '',
          interests: [],
        }),
      resetOnboarding: () => useUserStore.getState().signOut(),
    }),
    {
      name: 'vidflow-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        name: state.name,
        email: state.email,
        interests: state.interests,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[VidFlow] Failed to restore user profile', error);
        }
        useUserStore.setState({ hydrated: true });
      },
    },
  ),
);

export default useUserStore;
