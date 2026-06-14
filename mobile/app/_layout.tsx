import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name='preview' options={{ headerShown: false }} />
      <Stack.Screen name='journal/[id]' options={{headerShown: false}} />
    </Stack>
  );
}
