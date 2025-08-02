import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import CurrentPrepScreen from "../screens/CurrentPrepScreen";
import GroceryListScreen from "../screens/GroceryListScreen";
import PrepStackNavigator from "./PrepStackNavigator";
import SettingsStackNavigator from "./SettingsStackNavigator";
import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainAppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"];

          switch (route.name) {
            case "Recipes":
              iconName = "clipboard-outline";
              break;
            case "GroceryList":
              iconName = "cart-outline";
              break;
            case "Home":
              iconName = "home-outline";
              break;
            case "Stores":
              iconName = "storefront-outline";
              break;
            case "Settings":
              iconName = "settings-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Recipes" component={CurrentPrepScreen} />
      <Tab.Screen name="GroceryList" component={GroceryListScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stores" component={PrepStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}
