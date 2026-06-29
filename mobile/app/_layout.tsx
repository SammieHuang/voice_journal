import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SpecialElite_400Regular,
} from "@expo-google-fonts/special-elite";
import {
  useFonts,
  Kalam_300Light,
  Kalam_400Regular,
  Kalam_700Bold,
} from "@expo-google-fonts/kalam";

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
      SpecialElite_400Regular,
      Kalam_300Light,
      Kalam_400Regular,
      Kalam_700Bold,
    });
    if (!fontsLoaded) {
      return null;
    }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="journal/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/login"
          options={{
            title: "Log In",
            headerBackTitle: "",
            headerBackVisible: true,
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <Stack.Screen
          name="auth/signup"
          options={{
            title: "Sign Up",
            headerBackTitle: "",
            headerBackVisible: true,
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
