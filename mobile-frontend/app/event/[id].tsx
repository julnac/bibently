import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image } from "expo-image";
import GoingConfirmationModal from "@/features/events/components/GoingConfirmationModal";
import { useEvent } from '@/src/core/hooks/useEvent';
import { extractTime, buildFullAddress, formatPolishDate } from '@/features/events/adapters/eventAdapter';

const EventEntry = () => {
  const { id } = useLocalSearchParams();
  const { event, loading, error } = useEvent(id);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("Opis");
  const [isLiked, setIsLiked] = useState(false);
  const [isGoing, setIsGoing] = useState(false);
  const [showGoingModal, setShowGoingModal] = useState(false);

  const tabs = ["Opis", "Lokalizacja", "Bilety", "Organizator"];

  if (loading) return (
    <View className="flex-1 bg-white justify-center items-center">
      <Text className="text-gray-500 font-medium">Ładowanie wydarzenia...</Text>
    </View>
  );

  if (error || !event) return (
    <View className="flex-1 bg-white justify-center items-center p-5">
      <Ionicons name="alert-circle-outline" size={64} color="gray" />
      <Text className="text-gray-500 my-4 text-center">{error || 'Nie znaleziono wydarzenia'}</Text>
      <Pressable onPress={() => router.back()} className="bg-black px-8 py-3 rounded-full">
        <Text className="text-white font-bold">Wróć</Text>
      </Pressable>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Opis":
        return (
          <View className="px-5 py-6">
            <Text className="text-xl font-bold mb-3 text-gray-900">O wydarzeniu</Text>
            <Text className="text-base text-gray-600 leading-6">
              {event.description || "Brak szczegółowego opisu dla tego wydarzenia."}
            </Text>
            
            {/* Szybkie info z JSONa */}
            <View className="flex-row flex-wrap mt-6">
              {event.keywords?.map((keyword: string) => (
                <View key={keyword} className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-xs text-gray-600"># {keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case "Lokalizacja":
        return (
          <View className="px-5 py-6">
            <Text className="text-xl font-bold mb-3 text-gray-900">Miejsce</Text>
            <View className="bg-gray-100 h-48 rounded-2xl mb-4 items-center justify-center overflow-hidden">
               {/* Tutaj docelowo statyczna mapa z Google Maps API */}
               <Ionicons name="map" size={40} color="#ccc" />
               <Text className="text-gray-400 mt-2">Mapa: {event.location.name}</Text>
            </View>
            <View className="flex-row items-start justify-between bg-gray-50 p-4 rounded-xl">
              <View className="flex-1">
                <Text className="font-bold text-gray-900">{event.location.name}</Text>
                <Text className="text-gray-600 mt-1">
                  {buildFullAddress(event.location.address)}
                </Text>
              </View>
              <Pressable className="bg-white p-2 rounded-full shadow-sm">
                <Ionicons name="copy-outline" size={20} color="#000" />
              </Pressable>
            </View>
          </View>
        );

      case "Bilety":
        return (
          <View className="px-5 py-6">
            <Text className="text-xl font-bold mb-4 text-gray-900">Ceny i rezerwacja</Text>
            <View className="bg-black p-5 rounded-2xl flex-row justify-between items-center">
              <View>
                <Text className="text-gray-400 text-xs uppercase font-bold">Cena od</Text>
                <Text className="text-white text-2xl font-bold">
                  {event.offer.price > 0 ? `${event.offer.price} ${event.offer.currency}` : "Wstęp wolny"}
                </Text>
              </View>
              <Pressable className="bg-white px-6 py-3 rounded-xl">
                <Text className="font-bold">Zarezerwuj</Text>
              </Pressable>
            </View>
          </View>
        );

      case "Organizator":
        return (
          <View className="px-5 py-6">
            <Text className="text-xl font-bold mb-4 text-gray-900">Występuje</Text>
            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center">
                <Ionicons name="person" size={30} color="gray" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-gray-900">{event.performer?.name || "Organizator Bibently"}</Text>
                <Text className="text-gray-500">{event.performer?.type}</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Image */}
        <View className="relative">
          <Image 
            source={{ uri: event.imageUrl ?? undefined }}
            // className="w-full h-80"
            style={{width: `100%`, height: 280}}
            contentFit="cover"
            transition={500}
          />
          {/* Gradient overlay or dark tint for back button visibility */}
          <View className="absolute inset-0 bg-black/20" />
          
          <Pressable
            onPress={() => router.back()}
            className="absolute top-12 left-5 bg-white/90 rounded-full p-2 shadow-sm"
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </Pressable>

          {/* Badge Online/Offline */}
          <View className="absolute bottom-6 left-5 bg-black px-3 py-1 rounded-md">
            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
              {event.attendanceMode === "OnlineEventAttendanceMode" ? "💻 Online" : "📍 Na miejscu"}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-5 py-6 -mt-4 bg-white rounded-t-[32px]">
          <View className="flex-row justify-between items-start">
             <View className="flex-1">
                <Text className="text-xs text-primary font-bold uppercase mb-1">
                    {event.category?.replace('Event', '')}
                </Text>
                <Text className="text-3xl font-black text-gray-900 leading-tight">
                    {event.name}
                </Text>
             </View>
          </View>

          {/* Info Blocks */}
          <View className="flex-row mt-6 space-x-4">
            <View className="flex-1 flex-row items-center">
                <View className="bg-gray-100 p-2 rounded-lg mr-3">
                    <Ionicons name="calendar" size={18} color="black" />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-sm">{formatPolishDate(event.startDate)}</Text>
                    <Text className="text-gray-500 text-xs">
                      {extractTime(event.startDate)} 
                      {event.endDate ? ` - ${extractTime(event.endDate)}` : ""}
                    </Text>
                </View>
            </View>
          </View>
        </View>

        {/* Custom Tabs Navigation */}
        <View className="px-5 flex-row mt-4 border-b border-gray-100">
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`mr-6 pb-3 ${activeTab === tab ? "border-b-2 border-black" : ""}`}
            >
              <Text className={`text-sm ${activeTab === tab ? "font-bold text-black" : "text-gray-400"}`}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {renderTabContent()}
        <View className="h-32" />
      </ScrollView>

      {/* Floating Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 px-6 pt-4 pb-10 border-t border-gray-100 flex-row items-center space-x-4">
        <Pressable 
            onPress={() => setIsLiked(!isLiked)}
            className={`p-4 rounded-2xl border ${isLiked ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}
        >
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#EF4444" : "black"} />
        </Pressable>

        <Pressable
          onPress={() => {
            if (!isGoing) {
              setShowGoingModal(true);
              setIsGoing(true);
            } else {
              setIsGoing(false);
            }
          }}
          className={`flex-1 h-14 rounded-2xl items-center justify-center shadow-sm ${isGoing ? "bg-gray-200" : "bg-black"}`}
        >
          <Text className={`text-base font-bold ${isGoing ? "text-gray-700" : "text-white"}`}>
            {isGoing ? "Będę (Zrezygnuj)" : "Biorę udział"}
          </Text>
        </Pressable>
      </View>

      <GoingConfirmationModal
        visible={showGoingModal}
        onClose={() => setShowGoingModal(false)}
        eventTitle={event.name}
        eventDate={formatPolishDate(event.startDate)}
        eventTime={`${extractTime(event.startDate)} ${event.endDate ? ` - ${extractTime(event.endDate)}` : ""}`}
        eventAddress={buildFullAddress(event.location.address)}
        eventDistance="5 km"
        onAddToCalendar={() => {
          // Add to calendar logic
          console.log("Add to calendar");
        }}
        onShare={() => {
          // Share logic
          console.log("Share event");
        }}
        onNavigate={() => {
          // Navigate to location logic
          console.log("Navigate to location");
          setShowGoingModal(false);
        }}
      />
    </View>
  );
};

export default EventEntry;