import { Stack } from "expo-router";
import './global.css';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/core/state/user";
import { SearchProvider } from "@/features/search/context/SearchContext";
import { ThemeProvider } from "@/core/state/theme";
import { useEffect } from "react";
import { initMockAuthForDev } from "@/core/auth/initMockAuth";

export default function RootLayout() {
  // Initialize mock auth token for development
  useEffect(() => {
    if (__DEV__) {
      initMockAuthForDev();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <UserProvider>
          <SearchProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </SearchProvider>
        </UserProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
