import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Weatherio" }} />
      <Stack.Screen name="details" options={{ title: "Detailed weather" }} />
    </Stack>
  );
}
