import { Text, View, ScrollView, Image, Pressable} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Profile = () => {
  return (
    <ScrollView className="flex-1 bg-white px-4 pt-10">

      {/* Avatar + Name */}
      <View className="items-center mb-8">
        <Image
          source={{ uri: "https://i.pravatar.cc/200" }}
          className="w-24 h-24 rounded-full mb-4"
        />
        <Text className="text-xl font-semibold">John Doe</Text>
        <Text className="text-gray-500">johndoe@mail.com</Text>
      </View>

      {/* Settings section */}
      <View className="border-t border-gray-200 pt-6">

        <Pressable className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={22} color="black" />
            <Text className="text-base ml-3">Edit profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </Pressable>

        <Pressable className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Ionicons name="notifications-outline" size={22} color="black" />
            <Text className="text-base ml-3">Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </Pressable>

        <Pressable className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Ionicons name="heart-outline" size={22} color="black" />
            <Text className="text-base ml-3">Saved events</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </Pressable>

        <Pressable className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Ionicons name="settings-outline" size={22} color="black" />
            <Text className="text-base ml-3">App settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
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
    </ScrollView>
  );
}

export default Profile;
