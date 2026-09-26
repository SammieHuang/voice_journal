import { useEffect } from "react";
import Purchases from 'react-native-purchases'
import { supabase } from "@/services/supabase";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SpecialElite_400Regular,
} from "@expo-google-fonts/special-elite";
import {
  useFonts,
  Kalam_300Light,
  Kalam_400Regular,
  Kalam_700Bold,
} from "@expo-google-fonts/kalam";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({storage: AsyncStorage})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpecialElite_400Regular,
    Kalam_300Light,
    Kalam_400Regular,
    Kalam_700Bold,
  }); 
  useEffect(() => {
    Purchases.configure({
      apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
    });
  }, [])

  useEffect(() => {
    const { data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        Purchases.logIn(session.user.id)
      } else {
        Purchases.logOut()
      }
      queryClient.invalidateQueries({queryKey: ['profile']})
    })
    return ()=>subscription.unsubscribe() 
  }, [])
  if (!fontsLoaded) {
    return null;
  }
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
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
    </PersistQueryClientProvider>
  );
}
