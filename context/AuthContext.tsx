// ============================================
// FILE: context/AuthContext.tsx (FIXED VERSION)
// ============================================

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  registerApi,
} from "@/api/auth";
import { addFavoriteApi, removeFavoriteApi } from "@/api/Favorites";
import { AuthContextType, User } from "@/type/user";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";

// ====================
// CONSTANTS
// ====================
const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "userData";

interface JwtPayload {
  id: string;
  exp: number;
}

// ====================
// CONTEXT
// ====================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// ====================
// PROVIDER
// ====================
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ====================
  // TOKEN HELPERS
  // ====================
  const decodeToken = (token: string): JwtPayload | null => {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now() + 5 * 60 * 1000;
  };

  // ====================
  // STORAGE HELPERS
  // ====================
  const clearAuthData = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);

    if (isMounted.current) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    }
  };

  const saveAuthData = async (accessToken: string, refreshToken?: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }

    if (isMounted.current) {
      setToken(accessToken);
      setIsAuthenticated(true);
    }
  };

  // ====================
  // FETCH USER
  // ====================
  const fetchAndSetUser = async (accessToken: string) => {
    const userData = await getCurrentUser(accessToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    if (isMounted.current) setUser(userData);
  };

  // ====================
  // VALIDATE TOKEN
  // ====================
  const validateAndSetToken = async (accessToken: string) => {
    if (isTokenExpired(accessToken)) return false;

    await saveAuthData(accessToken);
    await fetchAndSetUser(accessToken);
    return true;
  };

  // ====================
  // REFRESH TOKEN
  // ====================
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue =
        await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (!refreshTokenValue) throw new Error("No refresh token");

      const response = await refreshTokenApi(refreshTokenValue);

      if (response.success && response.data?.accessToken) {
        await saveAuthData(
          response.data.accessToken,
          response.data.refreshToken
        );
        await validateAndSetToken(response.data.accessToken);
      } else {
        throw new Error("Refresh failed");
      }
    } catch (error) {
      console.error("Refresh token failed:", error);
      await clearAuthData();
      router.replace("/(auth)/login");
    }
  }, []);

  // ====================
  // BOOTSTRAP
  // ====================
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!storedToken) return;

        if (isTokenExpired(storedToken)) {
          await refreshToken();
        } else {
          await validateAndSetToken(storedToken);
        }
      } catch {
        await clearAuthData();
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    bootstrap();
  }, []);

  // ====================
  // LOGIN
  // ====================
  const login = async (email: string, password: string) => {
    if (authLoading) return;
    setAuthLoading(true);

    try {
      const response = await loginApi(email, password);
      if (!response.success || !response.data) {
        throw new Error(response.error);
      }

      await saveAuthData(response.data.accessToken, response.data.refreshToken);
      await fetchAndSetUser(response.data.accessToken);

      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
      throw error;
    } finally {
      if (isMounted.current) setAuthLoading(false);
    }
  };

  // ====================
  // REGISTER
  // ====================
  const register = async (name: string, email: string, password: string) => {
    if (authLoading) return;
    setAuthLoading(true);

    try {
      const response = await registerApi(name, email, password);
      if (!response.success || !response.data) {
        throw new Error(response.error);
      }

      await saveAuthData(response.data.accessToken, response.data.refreshToken);
      await fetchAndSetUser(response.data.accessToken);

      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
      throw error;
    } finally {
      if (isMounted.current) setAuthLoading(false);
    }
  };

  // ====================
  // LOGOUT
  // ====================
  const logout = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (accessToken) await logoutApi(accessToken);
    } catch {
      // ignore
    } finally {
      await clearAuthData();
      router.replace("/(auth)/login");
    }
  };

  // ====================
  // toggle favorites

  const toggleFavorite = async (listingId: string) => {
    if (!user || !token) return;

    const isFavorite = user.favorites.includes(listingId);

    // 🔥 Optimistic UI update
    const updatedFavorites = isFavorite
      ? user.favorites.filter((id) => id !== listingId)
      : [...user.favorites, listingId];

    const optimisticUser = {
      ...user,
      favorites: updatedFavorites,
    };

    setUser(optimisticUser);
    await SecureStore.setItemAsync("userData", JSON.stringify(optimisticUser));

    try {
      if (isFavorite) {
        await removeFavoriteApi(user.id, listingId, token);
      } else {
        await addFavoriteApi(user.id, listingId, token);
      }
    } catch (error) {
      // ❌ Rollback if API fails
      setUser(user);
      await SecureStore.setItemAsync("userData", JSON.stringify(user));
    }
  };

  // ====================

  // ====================
  // CONTEXT VALUE
  // ====================
  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    loading,
    authLoading,
    login,
    register,
    logout,
    refreshToken,
    toggleFavorite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ====================
// HOOK
// ====================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
