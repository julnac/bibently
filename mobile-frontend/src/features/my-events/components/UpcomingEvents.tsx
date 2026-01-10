import { Text, View} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, Pressable } from "react-native-gesture-handler";

const UpcomingEvents = () => {

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
        <View className="mb-10">
            {events.map((e) => (
                <View key={e.id} className="flex-row mb-6">
                <View className="w-24 h-24 bg-gray-200 rounded-xl mr-3" />

                <View className="flex-1">
                    <Text className="font-semibold text-base">{e.title}</Text>
                    <Text className="text-gray-500 text-sm">{e.date}</Text>

                    <View className="flex-row mt-1">
                    {e.tags.map((tag) => (
                        <View
                        key={tag}
                        className="bg-gray-100 px-2 py-0.5 rounded-lg mr-2"
                        >
                        <Text className="text-xs text-gray-600">{tag}</Text>
                        </View>
                    ))}
                    </View>

                    <Text className="text-gray-500 text-sm mt-1">{e.address}</Text>
                    <Text className="text-gray-400 text-xs">{e.going} going</Text>
                </View>
                </View>
            ))}
        </View>
    );
}

export default UpcomingEvents;