import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SettingsScreen from "../screens/SettingsScreen";
import ReportBugScreen from "../screens/ReportBugScreen";
import PersonalizeStoresScreen from "../screens/PersonalizeStoresScreen";

const Stack = createNativeStackNavigator();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: "Settings", headerShown: false }}
      />
      <Stack.Screen
        name="ReportBug"
        component={ReportBugScreen}
        options={{ title: "Submit Feedback", headerShown: false }}
      />
      <Stack.Screen
        name="PersonalizeStores"
        component={PersonalizeStoresScreen}
        options={{ title: "Personalize Store Names", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
