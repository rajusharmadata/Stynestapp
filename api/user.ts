import apiClient from "./client";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  favorites: string[];
  provider?: "local" | "google";
}

interface UserProfileResponse {
  success: boolean;
  data?: User;
  message?: string;
  error?: string;
}

export const getUserProfile = async (
  userId: string | undefined,
  accessToken: string
): Promise<UserProfileResponse> => {
  try {
    const response = await apiClient.get(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Get user profile error:", error);

    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch profile",
    };
  }
};
