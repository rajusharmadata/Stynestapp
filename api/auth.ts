// ============================================
import apiClient from "./client";

interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      favorites: string[];
      provider?: "local" | "google";
    };
  };
  error?: string;
  message?: string;
}

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post("api/auth/login", {
      email,
      password,
    });

    // Handle successful response
    if (response.data.success) {
      return {
        success: true,
        data: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
        },
      };
    }

    return {
      success: false,
      error: response.data.error || "Login failed",
    };
  } catch (error: any) {
    console.error("Login API error:", error);

    // Handle axios error response
    if (error.response?.data) {
      return {
        success: false,
        error:
          error.response.data.error ||
          error.response.data.message ||
          "Login failed",
      };
    }

    return {
      success: false,
      error: error.message || "Network error. Please check your connection.",
    };
  }
};

export const registerApi = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post("/api/auth/register", {
      name,
      email,
      password,
    });

    console.log("API Response:", response.data);

    if (response.data.success) {
      return {
        success: true,
        data: {
          accessToken: response.data.accessToken, // Changed from response.data.data.accessToken
          refreshToken: response.data.refreshToken, // Changed from response.data.data.refreshToken
          user: response.data.user, // Changed from response.data.data.user
        },
      };
    }

    return {
      success: false,
      error: response.data.error || "Registration failed",
    };
  } catch (error: any) {
    console.error("Register API error:", error);

    if (error.response?.data) {
      return {
        success: false,
        error:
          error.response.data.error ||
          error.response.data.message ||
          "Registration failed",
      };
    }

    return {
      success: false,
      error: error.message || "Network error. Please check your connection.",
    };
  }
};

export const getCurrentUser = async (accessToken: string): Promise<any> => {
  try {
    const response = await apiClient.get("api/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data.success) {
      return response.data.data;
    }

    return null;
  } catch (error: any) {
    console.error("Get current user API error:", error);
    return null;
  }
};

export const logout = async (token: string): Promise<void> => {
  try {
    await apiClient.post(
      "api/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Logout API error:", error);
    // Don't throw - local logout should proceed even if API fails
  }
};

export const refreshToken = async (
  refreshTokenValue: string
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post("api/auth/refresh", {
      refreshToken: refreshTokenValue,
    });

    if (response.data.success) {
      return {
        success: true,
        data: {
          accessToken: response.data.data.token,
          refreshToken: response.data.data.refreshToken,
          user: response.data.data.user,
        },
      };
    }

    return {
      success: false,
      error: "Failed to refresh token",
    };
  } catch (error: any) {
    console.error("Refresh token API error:", error);

    if (error.response?.data) {
      return {
        success: false,
        error: error.response.data.error || "Failed to refresh token",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to refresh token",
    };
  }
};

// Alias for compatibility
export const logoutApi = logout;
