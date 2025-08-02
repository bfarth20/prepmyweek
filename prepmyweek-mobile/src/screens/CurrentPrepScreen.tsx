import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { RecipeSummary } from "../types/shared";
import RecipeCard from "../components/RecipeCard";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import API_BASE_URL from "../utils/config";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import WalkthroughPopup from "../components/WalkthroughOverlay";

export default function CurrentPrepScreen() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loadingPrep, setLoadingPrep] = useState(true);
  const [error, setError] = useState("");
  const { user, token } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setError("You must be logged in to save a current prep.");
        setLoadingPrep(false);
        return;
      }

      const fetchCurrentPrep = async () => {
        try {
          setLoadingPrep(true); // set this here to show spinner when refetching
          const res = await axios.get(`${API_BASE_URL}/current-prep`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRecipes(res.data.data.recipes);
          setError("");
        } catch (err: any) {
          setError(
            axios.isAxiosError(err)
              ? err.response?.data?.error || "Failed to load current prep."
              : "An error occurred while loading current prep."
          );
          console.error("Fetch failed:", err);
        } finally {
          setLoadingPrep(false);
        }
      };

      fetchCurrentPrep();
    }, [token])
  );

  const handleSaveToPastPrep = () => {
    const recipeIds = recipes.map((r) => r.id);
    // You can build a modal or screen that asks for a title, then call the backend
    Alert.alert("Save to Past Prep", "Feature coming soon or link to modal.");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#d9f9fa" }}
      edges={["top", "left", "right"]}
    >
      {user?.walkthroughEnabled && <WalkthroughPopup page="currentPrep" />}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title} allowFontScaling={false}>
          Your Current Prep
        </Text>

        {loadingPrep && <ActivityIndicator size="large" color="#f97316" />}
        {error !== "" && <Text style={styles.error}>{error}</Text>}
        {!loadingPrep && !error && recipes.length === 0 && (
          <Text style={styles.message}>You have no saved prep.</Text>
        )}

        {!loadingPrep && !error && recipes.length > 0 && (
          <>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showPrepTracker={false}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.background },
  title: {
    fontSize: 28,
    color: colors.brand,
    fontFamily: "Montserrat_700Bold",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  error: { color: "red", textAlign: "center", marginVertical: 12 },
  message: { textAlign: "center", marginVertical: 12, fontSize: 16 },
  buttonRow: {
    flexDirection: "column",
    gap: 12,
    marginTop: 20,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  outlineButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f97316",
  },
  primaryButton: {
    backgroundColor: "#f97316",
  },
  buttonText: {
    color: "#f97316",
    fontWeight: "bold",
    fontSize: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
