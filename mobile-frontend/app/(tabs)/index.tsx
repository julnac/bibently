import { View, ScrollView} from "react-native";
import '../global.css';
import SearchBar from "../../components/search/SearchBar";
import ContinueExploring from "@/components/search/ContinueExploring";
import CommunityTrends from "@/components/search/CommunityTrends";
import SeeAllEventsButton from "@/components/search/SeeAllEventsButton";
import { useState } from "react";
import UseMyCurrentLocationButton from "@/components/search/UseMyCurrentLocationButton";
import SuggestionList from "@/components/search/SuggestionList";

export default function Index() {
  const [searchView, setSearchView] = useState<'default' | 'location' | 'general'>('default');

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-white px-4 pt-8">
        <SearchBar 
          placeholder="Location" 
          onPress={() => setSearchView('location')} 
          iconName="location-outline"/>
        <SearchBar 
          placeholder="Search" 
          onPress={() => setSearchView('general')} 
          iconName="search-outline"/>

        {/* Default view */}
        {searchView === 'default' && (
          <>
            <SeeAllEventsButton />
            <ContinueExploring />
            <CommunityTrends />
            <View className="mb-24" />
          </>
        )}

        {searchView === 'location' && (
          <>
            <UseMyCurrentLocationButton />
            <SuggestionList />
            <View className="mb-24" />
          </>
        )}

        {searchView === 'general' && (
          <>
            <SuggestionList />
            <View className="mb-24" />
          </>
        )}

      </ScrollView>
    </View>
  );
}
