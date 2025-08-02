import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../utils/config";
import { colors } from "../theme/colors";

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, setUser, logout, token } = useAuth();

  const walkthroughEnabled = user?.walkthroughEnabled ?? true;

  const handleToggleWalkthrough = async (value: boolean) => {
    try {
      await axios.put(
        `${API_BASE_URL}/users/walkthrough`,
        { enabled: value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update user in context
      setUser((prev) => (prev ? { ...prev, walkthroughEnabled: value } : prev));
    } catch (error) {
      console.error("Failed to update walkthrough setting:", error);
      Alert.alert("Error", "Failed to update walkthrough setting.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out?", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
          navigation.navigate("Welcome");
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? All your data including current and past preps will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/users/delete-account`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              logout(); // clear auth context
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              });
            } catch (error) {
              console.error("Failed to delete account:", error);
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#d9f9fa" }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Settings</Text>

          {!token ? (
            // Guest mode: show only Sign Up button
            <>
              <Text style={styles.subtext}>Want more features?</Text>
              <TouchableOpacity
                onPress={() => navigation.getParent()?.navigate("Signup")}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Walkthrough Switch */}
              <View style={styles.row}>
                <Text style={styles.label}>Walkthrough Mode</Text>
                <Switch
                  value={walkthroughEnabled}
                  onValueChange={handleToggleWalkthrough}
                />
              </View>

              {/* Report a Bug */}
              <TouchableOpacity
                onPress={() => navigation.navigate("ReportBug")}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Report a Bug</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("PersonalizeStores")}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Personalize Store Names</Text>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete Account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: colors.brand,
    fontFamily: "Montserrat_700Bold",
  },
  subtext: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
    fontFamily: "Montserrat_700Bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: colors.brand,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  logoutButton: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    marginBottom: 24,
  },
  logoutText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#ffdddd",
    alignItems: "center",
    marginBottom: 16,
  },
  deleteText: {
    color: "#cc0000",
    fontSize: 16,
    fontWeight: "600",
  },
});
