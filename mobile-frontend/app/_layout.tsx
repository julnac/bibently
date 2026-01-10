import { Stack } from "expo-router";
import './global.css';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/core/state/user";
import { SearchProvider } from "@/features/search/context/SearchContext";
import { ThemeProvider } from "@/core/state/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <UserProvider>
          <SearchProvider>
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="eventEntries/[id]"
                options={{ headerShown: false }}
              />
            </Stack>
          </SearchProvider>
        </UserProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
