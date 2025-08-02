import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import {
  useNavigation,
  NavigationProp,
  RouteProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import WalkthroughPopup from "../components/WalkthroughOverlay";
import { useAuth } from "../context/AuthContext";

type HomeScreenRouteProp = RouteProp<RootStackParamList, "MainApp">;

interface Props {
  route: HomeScreenRouteProp;
}

export default function HomeScreen({ route }: Props) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, token } = useAuth();

  const guestMode = !token;

  return (
    <View style={styles.container}>
      {!token && <WalkthroughPopup page="homeGuest" />}
      {user?.walkthroughEnabled && <WalkthroughPopup page="home" />}
      {/* Logo and Title */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logoNoBg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title} allowFontScaling={false}>
          PrepMyWeek
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate("Stores")}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.buttonText, styles.primaryButtonText]}
            allowFontScaling={false}
          >
            Start a Fresh Prep
          </Text>
        </TouchableOpacity>

        {!token && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate("Signup")}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.buttonText, styles.primaryButtonText]}
              allowFontScaling={false}
            >
              Want More Features? Sign Up!
            </Text>
          </TouchableOpacity>
        )}

        {!guestMode && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate("Recipes")}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.buttonText, styles.secondaryButtonText]}
              allowFontScaling={false}
            >
              View Current Prep
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  title: {
    fontSize: 36,
    color: colors.brand,
    fontFamily: "Montserrat_700Bold",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 400,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.brand,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.brand,
    backgroundColor: "white",
  },
  secondaryButtonText: {
    color: colors.brand,
    fontWeight: "700",
    fontSize: 18,
  },
  buttonText: {
    fontFamily: "Montserrat_700Bold",
  },
});
