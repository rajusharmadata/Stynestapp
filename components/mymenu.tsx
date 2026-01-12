import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const MENU_WIDTH = width * 0.8;

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  color: string;
}

export default function MyMenu() {
  const { open, toggleMenu, translateX, overlayOpacity } = useMenu();
  const { logout, user } = useAuth();
  console.log(user?.avatar);

  const menuItems: MenuItem[] = [
    {
      id: "home",
      label: "Home",
      icon: "home-outline",
      route: "/(tabs)/home",
      color: "#3B82F6",
    },
    {
      id: "bookings",
      label: "My Bookings",
      icon: "calendar-outline",
      route: "/(tabs)/bookings",
      color: "#8B5CF6",
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: "heart-outline",
      route: "/(tabs)/favorites",
      color: "#EF4444",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "person-outline",
      color: "#10B981",
      route: "/(tabs)/profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "settings-outline",
      route: "/(tabs)/settings",
      color: "#6B7280",
    },
    // {
    //   id: "help",
    //   label: "Help & Support",
    //   icon: "help-circle-outline",
    //   route: "/(tabs)/help",
    //   color: "#F59E0B",
    // },
  ];

  const handleMenuItemPress = (item: MenuItem) => {
    toggleMenu();
    setTimeout(() => {
      if (item.route) {
        router.push(item.route as any);
      }
    }, 300);
  };
  const handleLogout = async () => {
    try {
      await logout(); // clear tokens + auth state

      console.log("Logout successful");

      // 🚀 FORCE redirect
      // router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      toggleMenu();
    }
  };

  // Don't render if menu is closed
  if (!open) return null;

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "rgba(0,0,0,0.5)",
            opacity: overlayOpacity,
            zIndex: 998,
          },
        ]}
      >
        <Pressable onPress={toggleMenu} style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      {/* Side Menu */}
      <Animated.View
        style={{
          transform: [{ translateX }],
          width: MENU_WIDTH,
          position: "absolute",
          left: 0,
          top: 0,
          height,
          zIndex: 999,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 4, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 16,
        }}
      >
        {/* Header */}
        <View
          className="bg-blue-500 px-6 pb-6"
          style={{
            paddingTop:
              Platform.OS === "ios"
                ? 60
                : StatusBar.currentHeight
                  ? StatusBar.currentHeight + 20
                  : 40,
          }}
        >
          <TouchableOpacity
            onPress={toggleMenu}
            className="absolute right-4 bg-white/20 rounded-full p-2"
            style={{
              top:
                Platform.OS === "ios"
                  ? 48
                  : StatusBar.currentHeight
                    ? StatusBar.currentHeight + 8
                    : 28,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <View className="w-20 h-20 rounded-full bg-white  items-center justify-center mb-4">
            <Image
              source={{
                uri:
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff`,
              }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 999,
              }}
            />
          </View>

          <Text className="text-xl font-bold text-white mb-1">
            {user?.name}
          </Text>
          <Text className="text-sm text-white/90">{user?.email}</Text>

          <View className="flex-row mt-4 gap-3">
            <View className="bg-white/20 rounded-lg px-3 py-2">
              <Text className="text-white font-bold text-lg">12</Text>
              <Text className="text-white/80 text-xs">Bookings</Text>
            </View>
            <View className="bg-white/20 rounded-lg px-3 py-2">
              <Text className="text-white font-bold text-lg">8</Text>
              <Text className="text-white/80 text-xs">Favorites</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="flex-1 pt-4">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleMenuItemPress(item)}
              activeOpacity={0.7}
              className="flex-row items-center px-6 py-4"
            >
              <View
                className="w-11 h-11 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text className="ml-4 text-base font-medium text-gray-800">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="flex-row items-center justify-center py-4 rounded-xl bg-red-50"
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text className="ml-2 text-base font-semibold text-red-500">
              Logout
            </Text>
          </TouchableOpacity>
          <Text className="text-center text-xs text-gray-400 mt-3">
            Version 1.0.0
          </Text>
        </View>
      </Animated.View>
    </>
  );
}
