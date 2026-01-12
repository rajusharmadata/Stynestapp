import { useCallback, useEffect, useState } from "react";

import {
  addFavoriteApi,
  getFavoritesApi,
  removeFavoriteApi,
} from "@/api/Favorites";
import { useAuth } from "@/context/AuthContext";
import { FavoriteListing } from "@/type/property";
/* ---------------- TYPES ---------------- */

/* ---------------- COMPONENT ---------------- */

export default function Favorites() {
  const { user, token } = useAuth();

  const [favoritesList, setFavoritesList] = useState<FavoriteListing[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD FAVORITES ---------------- */

  useEffect(() => {
    if (user?.id && token) {
      loadFavorites();
    }
  }, [user, token]);

  const loadFavorites = async () => {
    try {
      setLoading(true);

      const response = await getFavoritesApi(user!.id, token!);
      const data: FavoriteListing[] =
        response?.data?.favorites ?? response?.data ?? [];

      setFavoritesList(data);
      setFavorites(new Set(data.map((item) => item.id)));
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- TOGGLE FAVORITE ---------------- */

  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!user || !token) return;

      // ✅ FIX: capture state BEFORE update
      const isFavorite = favorites.has(id);

      // 1️⃣ Optimistic UI update
      setFavorites((prev) => {
        const next = new Set(prev);
        isFavorite ? next.delete(id) : next.add(id);
        return next;
      });

      setFavoritesList((prev) =>
        isFavorite ? prev.filter((item) => item.id !== id) : prev
      );

      try {
        // 2️⃣ Backend sync
        if (isFavorite) {
          await removeFavoriteApi(user.id, id, token);
        } else {
          await addFavoriteApi(user.id, id, token);
        }
      } catch (error) {
        console.error("Toggle favorite failed:", error);

        // 3️⃣ Rollback on failure
        setFavorites((prev) => {
          const rollback = new Set(prev);
          isFavorite ? rollback.add(id) : rollback.delete(id);
          return rollback;
        });
      }
    },
    [favorites, user, token]
  );
}
