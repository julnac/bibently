import { Stack } from "expo-router";
import '../../global.css';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Mapa" }} />
      <Stack.Screen name="search" options={{ title: "Szukaj" }} />
      <Stack.Screen name="event/[id]" options={{ title: "Event" }} />
    </Stack>
  );
}