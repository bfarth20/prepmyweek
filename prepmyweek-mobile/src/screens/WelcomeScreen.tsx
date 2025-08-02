import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Logo + Title */}
      <View style={styles.logoRow}>
        <Image
          source={require("../../assets/logoNoBg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title} allowFontScaling={false}>
          PrepMyWeek
        </Text>
      </View>

      {/* Tagline */}
      <Text style={styles.tagline} allowFontScaling={false}>
        Plan smarter. Shop easier.
      </Text>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.primaryButtonText} allowFontScaling={false}>
            Log In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            navigation.navigate("Signup");
          }}
        >
          <Text style={styles.primaryButtonText} allowFontScaling={false}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
      <Text>Not Ready to Sign Up?</Text>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("MainApp")}
      >
        <Text style={styles.secondaryButtonText} allowFontScaling={false}>
          Check out the Demo
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.brand,
    fontFamily: "Montserrat_700Bold", // Montserrat for brand
  },
  tagline: {
    fontSize: 18,
    color: "#4b5563",
    marginBottom: 40,
    fontFamily: "Inter_400Regular", // Inter for body text
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold", // Inter semi-bold for buttons
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 12,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: colors.brand,
    fontSize: 16,

    fontWeight: "600",
  },
  tourLink: {
    color: "#6b7280",
    textDecorationLine: "underline",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
