import { LoginRequest, LoginResponse, User } from '@minaker/shared-types';
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'minaker_access_token';

interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  accessToken: string | null;
  user: User | null;
  role: User['role'] | null;
  setAuth: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoaded: false,
  isSignedIn: false,
  accessToken: null,
  user: null,
  role: null,

  /** Called after successful login — persists token to secure storage */
  setAuth: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ isSignedIn: true, accessToken: token, user, role: user.role });
  },

  /** Called on logout — clears token from secure storage */
  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ isSignedIn: false, accessToken: null, user: null, role: null });
  },

  /** Called on app startup — restores session from secure storage */
  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // TODO: decode JWT to get user info, or call /auth/me
        // For now, mark as loaded but not signed in until we validate
        set({ isLoaded: true, accessToken: token });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));
