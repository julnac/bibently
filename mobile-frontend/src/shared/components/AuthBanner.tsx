import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface AuthBannerProps {
  isDark: boolean;
}

const AuthBanner = ({ isDark }: AuthBannerProps) => {
  const router = useRouter();

  return (
    <View 
      className={`p-6 rounded-3xl mb-8 ${isDark ? "bg-neutral-800" : "bg-indigo-50"}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center mb-4">
        <View className={`p-3 rounded-2xl ${isDark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
          <Ionicons name="person-add-outline" size={24} color="#3C46FF" />
        </View>
        <Text className={`text-lg font-bold ml-4 ${isDark ? "text-white" : "text-neutral-900"}`}>
          Dołącz do Bibently
        </Text>
      </View>

      <Text className={`text-sm mb-6 leading-5 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
        Zaloguj się, aby zapisywać wydarzenia, personalizować powiadomienia i zarządzać swoim profilem.
      </Text>

      <View className="flex-row gap-3">
        <Pressable 
          onPress={() => router.push("/login")}
          className="flex-1 bg-indigo-600 py-3 rounded-xl items-center active:bg-indigo-700"
        >
          <Text className="text-white font-bold">Zaloguj się</Text>
        </Pressable>
        
        <Pressable 
          onPress={() => router.push("/register")}
          className={`flex-1 py-3 rounded-xl items-center border ${isDark ? "border-neutral-600" : "border-indigo-200 bg-white"}`}
        >
          <Text className={`font-bold ${isDark ? "text-white" : "text-indigo-600"}`}>Zarejestruj się</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default AuthBanner;