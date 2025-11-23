import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import '../global.css';

const _Layout = () => {
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
            name="index"
            options={{ 
              headerShown: false, 
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
            
        />
        <Tabs.Screen
            name="myEvents"
            options={{ 
              headerShown: false, 
              title: 'myEvents',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar-outline" size={size} color={color} />
              ),
            }}
        />
                <Tabs.Screen
            name="profile"
            options={{ 
              headerShown: false, 
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
        />
    </Tabs>
  )
}

export default _Layout;
