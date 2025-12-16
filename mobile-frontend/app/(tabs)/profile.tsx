import { Text, View, ScrollView, Image, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

const Profile = () => {
  const { theme, actualTheme, setTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const isDark = actualTheme === "dark";

  return (
    <ScrollView className={`flex-1 px-4 pt-10 ${isDark ? "bg-background-dark" : "bg-white"}`}>

      {/* Avatar + Name */}
      <View className="items-center mb-8">
        <Image
          source={{ uri: "https://i.pravatar.cc/200" }}
          className="w-24 h-24 rounded-full mb-4"
        />
        <Text className={`text-xl font-semibold ${isDark ? "text-white" : "text-black"}`}>
          John Doe
        </Text>
        <Text className={`${isDark ? "text-neutral-400" : "text-gray-500"}`}>
          johndoe@mail.com
        </Text>
      </View>

      {/* Settings section */}
      <View className={`border-t pt-6 ${isDark ? "border-neutral-700" : "border-gray-200"}`}>
        <Pressable className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Ionicons
              name="person-outline"
              size={22}
              color={isDark ? "#ECEFEF" : "black"}
            />
            <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
              Edit profile
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#ECEFEF" : "black"}
          />
        </Pressable>

        <Pressable className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Ionicons
              name="notifications-outline"
              size={22}
              color={isDark ? "#ECEFEF" : "black"}
            />
            <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
              Notifications
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#ECEFEF" : "black"}
          />
        </Pressable>

        <Pressable className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Ionicons
              name="heart-outline"
              size={22}
              color={isDark ? "#ECEFEF" : "black"}
            />
            <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
              Saved events
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#ECEFEF" : "black"}
          />
        </Pressable>

        {/* Theme Toggle */}
        <Pressable
          className="flex-row justify-between items-center py-4"
          onPress={() => setShowThemeModal(true)}
        >
          <View className="flex-row items-center">
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={22}
              color={isDark ? "#ECEFEF" : "black"}
            />
            <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
              Theme
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className={`text-sm mr-2 ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
              {theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#ECEFEF" : "black"}
            />
          </View>
        </Pressable>

        <Pressable className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Ionicons
              name="settings-outline"
              size={22}
              color={isDark ? "#ECEFEF" : "black"}
            />
            <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
              App settings
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#ECEFEF" : "black"}
          />
        </Pressable>
      </View>

      {/* Logout */}
      <View className="mt-8">
        <Pressable className="flex-row items-center py-4">
          <Ionicons name="log-out-outline" size={22} color="red" />
          <Text className="text-base ml-3 text-red-600 font-medium">Log out</Text>
        </Pressable>
      </View>

      <View className="h-24" />

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowThemeModal(false)}
        >
          <Pressable
            className={`rounded-t-3xl px-6 pb-8 pt-6 ${isDark ? "bg-surface-dark" : "bg-white"}`}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Pressable
              onPress={() => setShowThemeModal(false)}
              className="absolute top-6 right-6 z-10"
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? "#ECEFEF" : "#000"}
              />
            </Pressable>

            {/* Modal Title */}
            <Text className={`text-xl font-bold text-center mb-6 ${isDark ? "text-white" : "text-black"}`}>
              Choose Theme
            </Text>

            {/* Theme Options */}
            <View className="gap-3">
              {/* Light Mode */}
              <Pressable
                onPress={() => {
                  setTheme("light");
                  setShowThemeModal(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl ${
                  theme === "light"
                    ? isDark
                      ? "bg-neutral-700"
                      : "bg-gray-100"
                    : isDark
                    ? "bg-neutral-800"
                    : "bg-white border border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="sunny"
                    size={24}
                    color={isDark ? "#ECEFEF" : "#000"}
                  />
                  <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
                    Light
                  </Text>
                </View>
                {theme === "light" && (
                  <Ionicons name="checkmark" size={24} color="#3C46FF" />
                )}
              </Pressable>

              {/* Dark Mode */}
              <Pressable
                onPress={() => {
                  setTheme("dark");
                  setShowThemeModal(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl ${
                  theme === "dark"
                    ? isDark
                      ? "bg-neutral-700"
                      : "bg-gray-100"
                    : isDark
                    ? "bg-neutral-800"
                    : "bg-white border border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="moon"
                    size={24}
                    color={isDark ? "#ECEFEF" : "#000"}
                  />
                  <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
                    Dark
                  </Text>
                </View>
                {theme === "dark" && (
                  <Ionicons name="checkmark" size={24} color="#3C46FF" />
                )}
              </Pressable>

              {/* System Mode */}
              <Pressable
                onPress={() => {
                  setTheme("system");
                  setShowThemeModal(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl ${
                  theme === "system"
                    ? isDark
                      ? "bg-neutral-700"
                      : "bg-gray-100"
                    : isDark
                    ? "bg-neutral-800"
                    : "bg-white border border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="phone-portrait"
                    size={24}
                    color={isDark ? "#ECEFEF" : "#000"}
                  />
                  <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
                    System
                  </Text>
                </View>
                {theme === "system" && (
                  <Ionicons name="checkmark" size={24} color="#3C46FF" />
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default Profile;
