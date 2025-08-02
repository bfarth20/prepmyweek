import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

import StoresSelectionScreen from "../screens/StoresSelectionScreen";
import PrepConfigScreen from "../screens/PrepConfig";
import RecipeSelectScreen from "../screens/RecipeSelectScreen";
import FinalizePrepScreen from "../screens/FinalizePrepScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function PrepStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Stores" component={StoresSelectionScreen} />
      <Stack.Screen name="PrepConfig" component={PrepConfigScreen} />
      <Stack.Screen name="RecipeSelect" component={RecipeSelectScreen} />
      <Stack.Screen name="FinalizePrep" component={FinalizePrepScreen} />
    </Stack.Navigator>
  );
}
