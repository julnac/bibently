import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import '../global.css';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        // tabBarShowLabel: false,
        tabBarItemStyle: { 
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        },
        tabBarStyle: {
          backgroundColor: "#f3f4f6",
          // borderRadius: 50,
          // marginHorizontal: 20,
          // marginBottom: 36,
          // height: 70,
          // position: 'absolute',
          // overflow: 'hidden',
          // borderWidth: 1,
          // borderColor: "#e5e7eb",
        },
        tabBarActiveTintColor: "#4f46e5", 
        tabBarInactiveTintColor: "#9ca3af", 
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="myEvents"
        options={{
          title: 'My Events',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

