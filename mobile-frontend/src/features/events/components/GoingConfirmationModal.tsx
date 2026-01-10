import { View, Text, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface GoingConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventAddress: string;
  eventDistance: string;
  onAddToCalendar: () => void;
  onShare: () => void;
  onNavigate: () => void;
}

const GoingConfirmationModal = ({
  visible,
  onClose,
  eventTitle,
  eventDate,
  eventTime,
  eventAddress,
  eventDistance,
  onAddToCalendar,
  onShare,
  onNavigate,
}: GoingConfirmationModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-t-3xl px-6 pb-8 pt-6"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Pressable
            onPress={onClose}
            className="absolute top-6 right-6 z-10"
          >
            <Ionicons name="close" size={24} color="#000" />
          </Pressable>

          {/* Event Info */}
          <View className="items-center mt-8 mb-8">
            <Text className="text-xl font-bold text-center mb-2">
              {eventTitle}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              {eventDate}, {eventTime}
            </Text>
            <Text className="text-sm text-gray-500">
              {eventAddress} * {eventDistance}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            {/* Add to Calendar */}
            <Pressable
              onPress={onAddToCalendar}
              className="bg-black rounded-full py-4"
            >
              <Text className="text-white text-center font-semibold text-base">
                Add to calendar
              </Text>
            </Pressable>

            {/* Share */}
            <Pressable
              onPress={onShare}
              className="bg-white border border-black rounded-full py-4"
            >
              <Text className="text-black text-center font-semibold text-base">
                Share
              </Text>
            </Pressable>

            {/* Navigate to Location */}
            <Pressable
              onPress={onNavigate}
              className="bg-white border border-black rounded-full py-4"
            >
              <Text className="text-black text-center font-semibold text-base">
                Navigate to location
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default GoingConfirmationModal;
