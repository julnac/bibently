import { Stack } from "expo-router";
import './global.css';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/core/state/UserContext";
import { ThemeProvider } from "@/core/state/ThemeContext";
import { AuthProvider } from "@/src/core/context/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Ponów próbę 2 razy w razie błędu sieci
      staleTime: 1000 * 60 * 5, // Dane są "świeże" przez 5 minut
    },
  },
});

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <UserProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
                <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
                <Stack.Screen 
                  name="event/[id]" 
                  options={{ 
                    presentation: 'card', // Standardowe przejście "na wierzch"
                    headerShown: false    // Ukrywamy domyślny pasek, bo chcemy ukryć też Tabs
                  }} 
                />
              </Stack>
            </UserProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
