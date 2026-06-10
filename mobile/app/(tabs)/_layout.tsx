import { Tabs } from "expo-router";
import {
  useFonts,
  SpecialElite_400Regular,
} from "@expo-google-fonts/special-elite";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    SpecialElite_400Regular,
  });

  if (!fontsLoaded) return null;
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#55624F",
          height: 75,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#F8F1DD",
        tabBarInactiveTintColor: "#D0C9AE",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Journals",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="notebook-outline"
              color={color}
              size={26}
            />
          ),
          tabBarLabelStyle: {
            fontFamily: "SpecialElite_400Regular",
            fontSize: 14,
            marginBottom: 8,
          },
        }}
      />

      <Tabs.Screen
        name="new"
        options={{
          title: "Record",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="microphone-outline"
              color={color}
              size={26}
            />
          ),
          tabBarLabelStyle: {
            fontFamily: "SpecialElite_400Regular",
            fontSize: 14,
            marginBottom: 8,
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" color={color} size={26} />
          ),
          tabBarLabelStyle: {
            fontFamily: "SpecialElite_400Regular",
            fontSize: 14,
            marginBottom: 8,
          },
        }}
      />
    </Tabs>
  );
}
