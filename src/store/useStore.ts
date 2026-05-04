import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface UserProfileStore {
  profile: any | null;
  setProfile: (profile: any) => void;
  updatePoints: (newPoints: number) => void;
}

export const useProfileStore = create<UserProfileStore>()((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updatePoints: (newPoints) => 
    set((state) => ({ 
      profile: state.profile ? { ...state.profile, points: newPoints } : null 
    })),
}));
