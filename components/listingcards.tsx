import { addFavoriteApi, removeFavoriteApi } from "@/api/Favorites";
import { getAllListings } from "@/api/Listings";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { Heart, MapPin, Star } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
  category?: string; // beach, mountain, city, luxury, trending
}

interface ListingCardsProps {
  selectedCategory?: string;
}

export default function ListingCards({
  selectedCategory = "all",
}: ListingCardsProps) {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user, token } = useAuth();
  const loadListings = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      const res = await getAllListings();
      setData(res);
    } catch (err) {
      console.error("Error loading listings:", err);
      setError("Failed to load listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const onRefresh = useCallback(() => {
    loadListings(true);
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      // 1️⃣ Optimistic UI update
      setFavorites((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
      if (!user || !token) return;
      try {
        // 2️⃣ Sync with backend
        if (favorites.has(id)) {
          await removeFavoriteApi(user?.id, id, token);
        } else {
          await addFavoriteApi(user?.id, id, token);
        }
      } catch (error) {
        // 3️⃣ Rollback if API fails
        setFavorites((prev) => {
          const rollback = new Set(prev);
          rollback.has(id) ? rollback.delete(id) : rollback.add(id);
          return rollback;
        });
      }
    },
    [favorites]
  );

  // Filter data based on selected category
  const filteredData = useMemo(() => {
    if (selectedCategory === "all") return data;

    return data.filter((item) => {
      // If the listing has a category field, use it
      if (item.category) {
        return item.category.toLowerCase() === selectedCategory.toLowerCase();
      }

      // Otherwise, filter based on title or location keywords
      const searchText = `${item.title} ${item.location}`.toLowerCase();

      switch (selectedCategory.toLowerCase()) {
        case "beach":
          return (
            searchText.includes("beach") ||
            searchText.includes("ocean") ||
            searchText.includes("sea") ||
            searchText.includes("coastal")
          );
        case "mountain":
          return (
            searchText.includes("mountain") ||
            searchText.includes("cabin") ||
            searchText.includes("ski") ||
            searchText.includes("alpine")
          );
        case "city":
          return (
            searchText.includes("city") ||
            searchText.includes("urban") ||
            searchText.includes("downtown") ||
            searchText.includes("apartment")
          );
        case "luxury":
          return (
            searchText.includes("luxury") ||
            searchText.includes("villa") ||
            searchText.includes("mansion") ||
            item.price > 300
          ); // Luxury based on price
        case "trending":
          return item.rating && item.rating >= 4.5; // Trending = high rated
        default:
          return true;
      }
    });
  }, [data, selectedCategory]);

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => (
      <PropertyCard
        item={item}
        isFavorited={favorites.has(item.id)}
        onFavorite={toggleFavorite}
      />
    ),
    [favorites, toggleFavorite]
  );

  const keyExtractor = useCallback((item: Listing) => item.id, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading properties...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-red-500 text-lg font-semibold mb-4">{error}</Text>
        <TouchableOpacity
          onPress={() => loadListings()}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Category Result Count */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <Text className="text-sm text-gray-600">
          {filteredData.length}{" "}
          {filteredData.length === 1 ? "property" : "properties"}
          {selectedCategory !== "all" && (
            <Text className="font-semibold text-gray-900">
              {" "}
              in{" "}
              {selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)}
            </Text>
          )}
        </Text>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={10}
        initialNumToRender={6}
        windowSize={10}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View className="py-20 items-center">
            <Text className="text-gray-500 text-lg mb-2">
              No properties found
            </Text>
            <Text className="text-gray-400 text-sm">
              Try selecting a different category
            </Text>
          </View>
        }
      />
    </View>
  );
}

const PropertyCard = React.memo<{
  item: Listing;
  isFavorited: boolean;
  onFavorite: (id: string) => void;
}>(({ item, isFavorited, onFavorite }) => {
  const [imageError, setImageError] = useState(false);

  const handleCardPress = () => {
    router.push({
      pathname: "/property-detail",
      params: { id: item.id },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleCardPress}
      className="bg-white mx-4 my-2 rounded-2xl overflow-hidden"
      style={{
        width: CARD_WIDTH,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="relative">
        {!imageError ? (
          <Image
            source={{ uri: item.image }}
            className="w-full h-56"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-56 bg-gray-200 justify-center items-center">
            <Text className="text-gray-400">Image unavailable</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={(e: any) => {
            // Prevent card click when favorite button is pressed
            e.stopPropagation();
            onFavorite(item.id);
          }}
          className="absolute top-3 right-3 bg-white/90 p-2.5 rounded-full"
          activeOpacity={0.7}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Heart
            size={22}
            color={isFavorited ? "#EF4444" : "#374151"}
            fill={isFavorited ? "#EF4444" : "transparent"}
          />
        </TouchableOpacity>

        {item.rating && (
          <View className="absolute top-3 left-3 bg-white/90 px-3 py-1.5 rounded-full flex-row items-center">
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text className="ml-1 font-semibold text-gray-900 text-sm">
              {item.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      <View className="p-4">
        <Text
          className="text-xl font-bold text-gray-900 mb-2"
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <View className="flex-row items-center mb-3">
          <MapPin size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-1.5 text-sm" numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View className="flex-row items-baseline">
          <Text className="text-2xl font-bold text-gray-900">
            ${item.price}
          </Text>
          <Text className="text-gray-600 ml-1.5 text-sm">/ night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

PropertyCard.displayName = "PropertyCard";
