import { View, Text } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screen/Home";
import Search from "../screen/Search";
import Profile from "../screen/ProfileScreen";
import Icon from "react-native-vector-icons/Ionicons";
const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: true,
  tabBarHideOnKeyboard: true,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    height: 60,
    elevation: 0,
  },
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
            headerShown: false, // Ẩn tiêu đề Home
          tabBarIcon: ({ focused }) => (
            <Icon name="home" size={24} color={focused ? "blue" : "gray"} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
            headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name="search-outline"
              size={size}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
            headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name="person-outline"
              size={size}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
