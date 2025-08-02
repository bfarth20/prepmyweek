import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { usePrep } from "../context/PrepContext";
import { useAuth } from "../context/AuthContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import RecipeCard from "../components/RecipeCard";
import axios from "axios";
import API_BASE_URL from "../utils/config";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import WalkthroughPopup from "../components/WalkthroughOverlay";

type Props = NativeStackScreenProps<RootStackParamList, "FinalizePrep">;

export default function FinalizePrepScreen({ navigation, route }: Props) {
  const { selectedRecipes, clearPrep } = usePrep();
  const { user, loading, token } = useAuth();
  const guestMode = !token;

  if (loading) return null;

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    // Replace with your Toast component or Alert:
    Alert.alert(type === "error" ? "Error" : "Success", message);
  };

  const handleSaveCurrentPrep = () => {
    Alert.alert(
      "Confirm Save",
      "This will overwrite your previous CurrentPrep. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async () => {
            const recipeIds = selectedRecipes.map((r) => r.id.toString());

            if (!token) {
              showToast("You must be logged in to save your prep.", "error");
              return;
            }

            try {
              await axios.post(
                `${API_BASE_URL}/current-prep`,
                { recipeIds },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              showToast("CurrentPrep saved!", "success");
            } catch (error: unknown) {
              showToast("Failed to save prep. Please try again.", "error");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {!token && <WalkthroughPopup page="finalizedGuest" />}
      {user?.walkthroughEnabled && <WalkthroughPopup page="finishedPrep" />}
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle} allowFontScaling={false}>
          Selected Recipes
        </Text>

        {selectedRecipes.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No recipes selected.
          </Text>
        )}

        {selectedRecipes.map((recipe) => (
          <RecipeCard
            key={`recipe-${recipe.id}`}
            recipe={recipe}
            showPrepTracker={true}
          />
        ))}

        <View style={styles.buttonsContainer}>
          {!guestMode && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSaveCurrentPrep}
            >
              <Text style={styles.primaryButtonText} allowFontScaling={false}>
                Save as CurrentPrep
              </Text>
            </TouchableOpacity>
          )}
          {!token && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => {
                navigation.navigate("Signup");
              }}
            >
              <Text style={styles.primaryButtonText} allowFontScaling={false}>
                Sign Up Now!
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              clearPrep();
              navigation.navigate("Stores");
            }}
          >
            <Text style={styles.primaryButtonText} allowFontScaling={false}>
              Start Over
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  backButton: { marginBottom: 12 },
  backButtonText: { color: "#007aff", fontSize: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 8,
    color: colors.brand,
    fontFamily: "Montserrat_700Bold",
  },
  buttonsContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: colors.brand,
    backgroundColor: "white",
  },
  outlineButtonText: {
    color: colors.brand,
    fontWeight: "700",
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
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
    fontFamily: "Montserrat_700Bold",
  },
});
