import { Tabs } from "expo-router";
import {
  useFonts,
  SpecialElite_400Regular,
} from "@expo-google-fonts/special-elite";
import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
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
        tabBarStyle: { ...styles.tabBarStyle },
        tabBarActiveTintColor: colors.tabBarActiveTintColor,
        tabBarInactiveTintColor: colors.tabBarInactiveTintColor,
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
          tabBarLabelStyle: { ...styles.tabBarLabelStyle },
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
          tabBarLabelStyle: { ...styles.tabBarLabelStyle },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" color={color} size={26} />
          ),
          tabBarLabelStyle: { ...styles.tabBarLabelStyle },
        }}
      />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: colors.tabBarBGColor,
    height: 75,
    borderTopWidth: 0,
  },
  tabBarLabelStyle: {
    fontFamily: "SpecialElite_400Regular",
    fontSize: 14,
    marginBottom: 8,
  },
});