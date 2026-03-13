import { Text, View, ScrollView, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/core/state/ThemeContext";
import { useState } from "react";
import { useAuth } from "@/core/context/AuthContext";
import AuthBanner from "@/src/shared/components/AuthBanner";
import SettingsItem from "@/src/features/profile/components/SettingsItem";
import ThemeSelectionModal from "@/src/features/profile/components/ThemeSelectionModal";

const Profile = () => {
  const { theme, actualTheme, setTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const isDark = actualTheme === "dark";
  const { isAuthenticated, logout } = useAuth();

  return (
    <ScrollView className={`flex-1 px-4 pt-10 ${isDark ? "bg-background-dark" : "bg-white"}`}>

      {/* Avatar + Name */}
      {isAuthenticated ? (
        /* Widok dla zalogowanego - Avatar + Name */
        <View className="items-center mb-8">
          <View className="relative">
            <Image
              source={{ uri: "https://i.pravatar.cc/200" }}
              className="w-24 h-24 rounded-full mb-4 border-2 border-indigo-500"
            />
            <Pressable className="absolute bottom-4 right-0 bg-indigo-600 p-2 rounded-full border-2 border-white">
              <Ionicons name="camera" size={16} color="white" />
            </Pressable>
          </View>
          <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>
            John Doe
          </Text>
          <Text className={`${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            johndoe@mail.com
          </Text>
        </View>
      ) : (
        /* Widok dla gościa - Baner zachęcający */
        <AuthBanner isDark={isDark} />
      )}

      {/* Settings section */}
      <View className={`border-t pt-6 ${isDark ? "border-neutral-700" : "border-gray-200"}`}>
        <SettingsItem icon="person-outline" label="Edit profile" isDark={isDark} />
        <SettingsItem icon="notifications-outline" label="Notifications" isDark={isDark} />
        <SettingsItem icon="language-outline" label="Language" isDark={isDark} />
        <SettingsItem icon="heart-outline" label="Saved events" isDark={isDark} />
        <SettingsItem 
          icon={isDark ? "moon-outline" : "sunny-outline"} 
          label="Theme" 
          value={theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}
          onPress={() => setShowThemeModal(true)}
          isDark={isDark}
        />
        <SettingsItem icon="settings-outline" label="App settings" isDark={isDark} />
      </View>

      {/* Logout */}
      {isAuthenticated && (
        <View className="mt-8">
          <Pressable onPress={logout} className="flex-row items-center py-4">
            <Ionicons name="log-out-outline" size={22} color="red" />
            <Text className="text-base ml-3 text-red-600 font-medium">Log out</Text>
          </Pressable>
        </View>
      )}
      <View className="h-24" />

      {/* Theme Selection Modal */}
      <ThemeSelectionModal 
        isVisible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        theme={theme}
        setTheme={setTheme}
        isDark={isDark}
      />
    </ScrollView>
  );
};

export default Profile;
