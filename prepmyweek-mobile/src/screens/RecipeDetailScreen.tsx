import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { usePrep } from "../context/PrepContext";
import { useAuth } from "../context/AuthContext";
import { PrepTracker } from "../components/PrepTracker";
import API_BASE_URL from "../utils/config";
import { getRecipeImage } from "../utils/RecipeImages";
import { Ingredient, RecipeDetail } from "../types/shared";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import WalkthroughPopup from "../components/WalkthroughOverlay";

interface Props {
  route: {
    params: {
      recipeId: number;
      showPrepTracker?: boolean;
    };
  };
  navigation: any;
}

export default function RecipeDetailScreen({ route, navigation }: Props) {
  const { recipeId, showPrepTracker = true } = route.params;
  const { addDinner } = usePrep();
  const { user, token } = useAuth();

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipe data by ID
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/recipes/${recipeId}?preferMetric=${
            user?.preferMetric ?? false
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRecipe(res.data.data ?? res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [recipeId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text>Loading recipe...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "red" }}>{error ?? "Recipe not found"}</Text>
      </View>
    );
  }

  const handleAddToPrep = () => {
    addDinner(recipe);
    Alert.alert("Success", "Recipe added to prep!");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {(user?.walkthroughEnabled || !token) && (
        <WalkthroughPopup page="recipeDetail" />
      )}
      {showPrepTracker && <PrepTracker />}

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>{recipe.title}</Text>

          {recipe.isVegetarian && (
            <View style={styles.vegetarianBadge}>
              <Text style={styles.vegetarianText}>Vegetarian</Text>
            </View>
          )}

          {recipe.imageUrl && (
            <Image
              source={getRecipeImage(recipe.imageUrl)}
              style={styles.image}
            />
          )}

          <Text style={styles.description}>{recipe.description}</Text>

          <View style={styles.timesRow}>
            <Text style={styles.timeText}>
              Prep Time: {recipe.prepTime ?? "N/A"} min
            </Text>
            <Text style={styles.timeText}>
              Cook Time: {recipe.cookTime ?? "N/A"} min
            </Text>
            <Text style={styles.timeText}>
              Total Time: {recipe.totalTime} min
            </Text>
            <Text style={styles.timeText}>
              Servings: {recipe.servings ?? "N/A"}
            </Text>
            <Text style={styles.timeText}>
              Course: {recipe.course ?? "N/A"}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ing) => (
            <Text key={ing.id} style={styles.ingredientText}>
              •{" "}
              {ing.formattedQuantity ??
                `${ing.quantity ?? "?"} ${ing.unit ?? ""}`}{" "}
              {ing.name}
              {ing.preparation ? `, ${ing.preparation}` : ""}
              {ing.isOptional ? " (optional)" : ""}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructions}>{recipe.instructions}</Text>

          {showPrepTracker && (
            <TouchableOpacity
              onPress={handleAddToPrep}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add to Prep</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  backButton: { marginBottom: 12 },
  backButtonText: { color: "#007aff", fontSize: 16 },
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
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Montserrat_700Bold",
  },
  vegetarianBadge: {
    backgroundColor: "#d1fae5",
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  vegetarianText: {
    color: "#065f46",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: "#333",
    fontFamily: "Inter_600SemiBold",
  },
  timesRow: {
    marginBottom: 16,
  },
  timeText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    fontFamily: "Inter_400Regular",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 8,
    fontFamily: "Montserrat_700Bold",
  },
  ingredientText: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
    fontFamily: "Inter_400Regular",
  },
  instructions: {
    fontSize: 16,
    color: "#444",
    marginBottom: 24,
    fontFamily: "Inter_400Regular",
  },
  addButton: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
  },
});
