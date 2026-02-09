import { Stack } from "expo-router";
import './global.css';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/core/state/user";
import { SearchProvider } from "@/features/search/context/SearchContext";
import { ThemeProvider } from "@/core/state/theme";
import { AuthProvider } from "@/src/core/context/AuthContext";

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <UserProvider>
            <SearchProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
            </SearchProvider>
          </UserProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
