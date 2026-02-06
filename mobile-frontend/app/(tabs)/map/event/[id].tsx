import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import GoingConfirmationModal from "@/features/events/components/GoingConfirmationModal";
import { eventsService } from "@/features/events/services/events.service";
import { Event } from "@/features/events/types/event.types";

const EventEntry = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Description");
  const [isLiked, setIsLiked] = useState(false);
  const [isGoing, setIsGoing] = useState(false);
  const [showGoingModal, setShowGoingModal] = useState(false);

  // API state management
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    "Description",
    "Location",
    "Tickets",
    "Organizer",
    "Interested",
    "Opinions",
  ];

  // Fetch event from API
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    async function fetchEvent() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await eventsService.getById(id);
        setEvent(data);
      } catch (err) {
        setError('Failed to load event details');
        console.error('Error loading event:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const renderTabContent = () => {
    if (!event) return null;

    switch (activeTab) {
      case "Description":
        return (
          <View className="px-5 py-4">
            <Text className="text-2xl font-bold mb-4">Description</Text>
            <Text className="text-base text-gray-700 leading-6">
              Event details for {event.title}
            </Text>
          </View>
        );

      case "Location":
        return (
          <View className="px-5 py-4">
            <Text className="text-2xl font-bold mb-4">Location</Text>
            <View className="bg-gray-200 h-48 rounded-lg mb-4" />
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-gray-700">
                {event.address}
              </Text>
              <Pressable className="p-2">
                <Ionicons name="copy-outline" size={20} color="#666" />
              </Pressable>
            </View>
          </View>
        );

      case "Tickets":
        return (
          <View className="px-5 py-4">
            <Text className="text-2xl font-bold mb-4">
              Tickets / Reservation
            </Text>
            <View className="flex-row items-center bg-gray-50 p-4 rounded-lg">
              <View className="w-10 h-10 bg-gray-200 rounded mr-3" />
              <View>
                <Text className="font-semibold">Organizer</Text>
                <Text className="text-sm text-gray-600">
                  Visit event page
                </Text>
              </View>
            </View>
          </View>
        );

      case "Organizer":
        return (
          <View className="px-5 py-4">
            <Text className="text-2xl font-bold mb-4">Organizer</Text>
            <Text className="text-base text-gray-700 leading-6">
              Information about the event organizer.
            </Text>
          </View>
        );

      case "Interested":
        return (
          <View className="px-5 py-4">
            <Text className="text-2xl font-bold mb-4">Interested</Text>
            <Text className="text-base text-gray-500">
              No interested users yet
            </Text>
          </View>
        );

      case "Opinions":
        return (
          <View className="px-5 py-4">
            <Text className="text-2xl font-bold mb-4">Opinions</Text>
            <Text className="text-base text-gray-500">
              No opinions yet. Be the first to share your thoughts!
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text>Loading event...</Text>
      </View>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-5">
        <Text className="text-red-500 mb-3 text-center">{error || 'Event not found'}</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-black px-5 py-3 rounded-full"
        >
          <Text className="text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header with Image */}
        <View className="relative">
          {/* Event Image */}
          <View className="h-64 bg-gray-200" />

          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="absolute top-12 left-5 bg-white rounded-full p-2"
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </Pressable>
        </View>

        {/* Event Details */}
        <View className="px-5 py-4">
          {/* Title and Like */}
          <View className="flex-row justify-between items-start mb-3">
            <Text className="text-2xl font-bold flex-1 mr-3">
              {event.title}
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color="#DC5B40"
              />
              <Text className="text-sm text-gray-600 ml-1">0</Text>
            </View>
          </View>

          {/* Date and Time */}
          <Text className="text-base text-red-500 mb-1">
            {event.date}, {event.startTime}-{event.endTime}
          </Text>

          {/* Location */}
          <Text className="text-sm text-gray-500 mb-4">{event.address}</Text>

          {/* Tags */}
          <View className="flex-row flex-wrap mb-4">
            {event.tags.map((tag, index) => (
              <View
                key={index}
                className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
              >
                <Text className="text-sm text-gray-600">{tag}</Text>
              </View>
            ))}
          </View>

          {/* Going Count with Avatars */}
          <View className="flex-row items-center mb-6">
            <Text className="text-sm text-gray-700 mr-2">going: {event.going}</Text>
            <View className="flex-row">
              {[1, 2, 3].map((_, index) => (
                <View
                  key={index}
                  className="w-8 h-8 rounded-full bg-gray-300 -ml-2 first:ml-0"
                  style={{ marginLeft: index === 0 ? 0 : -8 }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-b border-gray-200"
        >
          <View className="flex-row px-5">
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`mr-6 pb-3 ${
                  activeTab === tab ? "border-b-2 border-black" : ""
                }`}
              >
                <Text
                  className={`text-base ${
                    activeTab === tab
                      ? "font-semibold text-black"
                      : "text-gray-500"
                  }`}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Bottom spacing for fixed button */}
        <View className="h-24" />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-3">
        <View className="flex-row items-center justify-between">
          {/* Navigation Icon */}
          <Pressable className="bg-black rounded-full p-3">
            <Ionicons name="navigate" size={20} color="white" />
          </Pressable>

          {/* Going Button */}
          <Pressable
            onPress={() => {
              if (!isGoing) {
                setShowGoingModal(true);
                setIsGoing(true);
              } else {
                setIsGoing(false);
              }
            }}
            className={`flex-1 mx-3 py-3 rounded-full ${
              isGoing ? "bg-gray-300" : "bg-black"
            }`}
          >
            <Text
              className={`text-center text-base font-semibold ${
                isGoing ? "text-gray-700" : "text-white"
              }`}
            >
              {isGoing ? "Cancel" : "Going"}
            </Text>
          </Pressable>

          {/* Calendar Icon */}
          <Pressable className="bg-primary border border-gray-300 rounded-full p-3 mr-2">
            <Ionicons name="calendar-outline" size={20} color="#fff" />
          </Pressable>

          {/* Share Icon */}
          <Pressable className="bg-primary border border-gray-300 rounded-full p-3 mr-2">
            <Ionicons name="share-outline" size={20} color="#fff" />
          </Pressable>

          {/* Favorite Icon */}
          <Pressable
            onPress={() => setIsLiked(!isLiked)}
            className="bg-primary border border-gray-300 rounded-full p-3"
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color="#DC5B40"
            />
          </Pressable>
        </View>
      </View>

      {/* Going Confirmation Modal */}
      <GoingConfirmationModal
        visible={showGoingModal}
        onClose={() => setShowGoingModal(false)}
        eventTitle={event.title}
        eventDate={event.date}
        eventTime={`${event.startTime}-${event.endTime}`}
        eventAddress={event.address}
        eventDistance=""
        onAddToCalendar={() => {
          // Add to calendar logic
          console.log("Add to calendar");
          setShowGoingModal(false);
        }}
        onShare={() => {
          // Share logic
          console.log("Share event");
          setShowGoingModal(false);
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
