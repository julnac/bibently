import { Text, View} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, Pressable } from "react-native-gesture-handler";

const LikedSection = () => {

    // przykładowe eventy
    const events = [
        {
        id: 1,
        title: "Halloween Party",
        date: "17 września, 19:00–2:00",
        tags: ["Concert", "Techno"],
        address: "ul. Wrzosowa 7, Gdańsk",
        going: 74,
        },
    ];
    
    return (
        <View className="border-t border-gray-200 pt-6">
            <Text className="font-semibold mb-3">Liked</Text>

            {events.map((e) => (
            <Pressable key={e.id} className="flex-row justify-between py-3">
                <View>
                <Text className="font-medium">{e.title}</Text>
                <Text className="text-gray-500 text-xs">Today • Free</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="black" />
            </Pressable>
            ))}
        </View>
    );
}

export default LikedSection;