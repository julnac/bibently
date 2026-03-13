import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ThemeSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  isDark: boolean;
}

const ThemeSelectionModal = ({ 
  isVisible, 
  onClose, 
  theme, 
  setTheme, 
  isDark 
}: ThemeSelectionModalProps) => {

  const options = [
    { id: "light", label: "Light", icon: "sunny" },
    { id: "dark", label: "Dark", icon: "moon" },
    { id: "system", label: "System", icon: "phone-portrait" },
  ] as const;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          className={`rounded-t-3xl px-6 pb-8 pt-6 ${isDark ? "bg-neutral-900" : "bg-white"}`}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Pressable onPress={onClose} className="absolute top-6 right-6 z-10">
            <Ionicons
              name="close"
              size={24}
              color={isDark ? "#ECEFEF" : "#000"}
            />
          </Pressable>

          <Text className={`text-xl font-bold text-center mb-6 ${isDark ? "text-white" : "text-black"}`}>
            Choose Theme
          </Text>

          <View className="gap-3">
            {options.map((option) => {
              const isSelected = theme === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setTheme(option.id);
                    onClose();
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-xl ${
                    isSelected
                      ? isDark ? "bg-neutral-800" : "bg-gray-100"
                      : isDark ? "bg-neutral-800/40" : "bg-white border border-gray-100"
                  }`}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={isDark ? "#ECEFEF" : "#000"}
                    />
                    <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
                      {option.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={24} color="#3C46FF" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ThemeSelectionModal;