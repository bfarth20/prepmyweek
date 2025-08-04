import React from "react";
import { Text, View } from "react-native";
import RootNavigator from "./src/navigation/RootNavigator";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { AuthProvider } from "./src/context/AuthContext";
import { PrepProvider } from "./src/context/PrepContext";

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <PrepProvider>
        <RootNavigator />
      </PrepProvider>
    </AuthProvider>
  );
}
