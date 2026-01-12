import apiClient from "./client";

export const getFavoritesApi = async (userId: string, token: string) => {
  const res = await apiClient.get(`/api/users/${userId}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addFavoriteApi = async (
  userId: string,
  listingId: string,
  token: string
) => {
  const res = await apiClient.post(
    `/api/users/${userId}/favorites/${listingId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const removeFavoriteApi = async (
  userId: string,
  listingId: string,
  token: string
) => {
  const res = await apiClient.delete(
    `/api/users/${userId}/favorites/${listingId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
