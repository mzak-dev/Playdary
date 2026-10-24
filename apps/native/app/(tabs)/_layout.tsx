import { useTokenColor } from "@playdary/design-system-native";
import { Tabs } from "expo-router";
import { House, Library, Search, User, Users } from "lucide-react-native";

export default function TabsLayout() {
  const background = useTokenColor("card");
  const border = useTokenColor("border");
  const active = useTokenColor("primary");
  const inactive = useTokenColor("mutedForeground");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: { backgroundColor: background, borderTopColor: border },
        tabBarLabelStyle: { fontFamily: "DMSans_600SemiBold", fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Start", tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="search" options={{ title: "Szukaj", tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }} />
      <Tabs.Screen name="lists" options={{ title: "Listy", tabBarIcon: ({ color, size }) => <Library color={color} size={size} /> }} />
      <Tabs.Screen name="friends" options={{ title: "Znajomi", tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
