import { useAuth } from "@/context/AuthContext";
import { menuItems } from "@/data/Menudata";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Profile() {
  const { logout, isAuthenticated, user, token } = useAuth();

  const logoutHandler = async () => {
    // Implement logout functionality
    try {
      // ✅ Just call login
      await logout();
      console.log(isAuthenticated);
      router.push("/(auth)/login");
    } catch (error: any) {
      Alert.alert(
        "Looout Failed",
        error?.message || "Invalid email or password"
      );
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white px-6 py-6 items-center border-b border-gray-100">
          <View className="relative">
            <Image
              source={{ uri: user?.avatar }}
              className="w-24 h-24 rounded-full"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-red-500 w-8 h-8 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mt-4">
            {user?.name}
          </Text>
          <Text className="text-gray-600 mt-1">{user?.email}</Text>

          <TouchableOpacity
            className="mt-4 px-6 py-2 bg-gray-100 rounded-full"
            activeOpacity={0.7}
          >
            <Text className="text-gray-900 font-semibold">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row bg-white mx-4 mt-4 rounded-xl overflow-hidden shadow-sm">
          <View className="flex-1 items-center py-4 border-r border-gray-100">
            <Text className="text-2xl font-bold text-gray-900">12</Text>
            <Text className="text-gray-600 text-sm mt-1">Trips</Text>
          </View>
          <View className="flex-1 items-center py-4 border-r border-gray-100">
            <Text className="text-2xl font-bold text-gray-900">
              {user?.favorites?.length}
            </Text>
            <Text className="text-gray-600 text-sm mt-1">Favorites</Text>
          </View>
          <View className="flex-1 items-center py-4">
            <Text className="text-2xl font-bold text-gray-900">3</Text>
            <Text className="text-gray-600 text-sm mt-1">Reviews</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white mx-4 mt-4 rounded-xl overflow-hidden shadow-sm">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              activeOpacity={0.7}
              className={`flex-row items-center px-4 py-4 ${
                index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name={item.icon as any} size={20} color="#374151" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-base font-semibold text-gray-900">
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-white mx-4 mt-4 mb-6 rounded-xl py-4 items-center shadow-sm"
          activeOpacity={0.7}
          onPress={logoutHandler}
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 font-semibold ml-2">Logout</Text>
          </View>
        </TouchableOpacity>

        <Text className="text-center text-gray-400 text-xs mb-6">
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
