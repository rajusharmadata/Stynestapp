import { router } from "expo-router";
export const menuItems = [
  {
    id: "1",
    icon: "person-outline",
    title: "Personal Information",
    subtitle: "Update your details",
    onPress: () => {},
  },
  {
    id: "2",
    icon: "wallet-outline",
    title: "Payments & Payouts",
    subtitle: "Manage payment methods",
    onPress: () => {},
  },
  {
    id: "3",
    icon: "notifications-outline",
    title: "Notifications",
    subtitle: "Manage your notifications",
    onPress: () => {},
  },
  {
    id: "4",
    icon: "shield-checkmark-outline",
    title: "Privacy & Security",
    subtitle: "Control your privacy",
    onPress: () => {},
  },
  {
    id: "5",
    icon: "settings-outline",
    title: "Settings",
    subtitle: "App preferences",
    onPress: () => router.push("/(tabs)/settings"),
  },
  {
    id: "6",
    icon: "help-circle-outline",
    title: "Help & Support",
    subtitle: "Get help",
    onPress: () => {},
  },
];
