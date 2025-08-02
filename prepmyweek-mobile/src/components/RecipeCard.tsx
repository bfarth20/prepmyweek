import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RecipeSummary } from "../types/shared";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { getRecipeImage } from "../utils/RecipeImages";

type Props = {
  recipe: RecipeSummary;
  onAddToPrep?: (recipe: RecipeSummary) => void;
  isSelected?: boolean;
  showPrepTracker: boolean;
};

export default function RecipeCard({
  recipe,
  onAddToPrep,
  isSelected,
  showPrepTracker = true,
}: Props) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  function formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min`;
  }

  function formatCourse(course: string): string {
    if (course === "DINNER") return "Dinner";
    if (course === "LUNCH") return "Lunch";
    if (course === "SNACK_SIDE") return "Snack or Side";
    if (course === "BREAKFAST") return "Breakfast";
    return course;
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected ? styles.selectedCard : styles.unselectedCard,
      ]}
      onPress={() =>
        navigation.navigate("RecipeDetail", {
          recipeId: recipe.id,
          showPrepTracker,
        })
      }
    >
      {recipe.imageUrl && getRecipeImage(recipe.imageUrl) ? (
        <Image source={getRecipeImage(recipe.imageUrl)} style={styles.image} />
      ) : (
        <Text>No Image</Text>
      )}
      {recipe.isVegetarian && (
        <View style={styles.vegBadge}>
          <Text style={styles.vegBadgeText}>Vegetarian</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.detail}>Course: {formatCourse(recipe.course)}</Text>
        <Text style={styles.detail}>
          Total Time:{" "}
          {recipe.totalTime != null ? formatTime(recipe.totalTime) : "??"}
        </Text>
        <Text style={styles.detail}>Servings: {recipe.servings ?? "??"}</Text>
        <Text style={styles.detail}>
          Ingredients: {recipe.ingredientCount ?? 0}
        </Text>

        {onAddToPrep && (
          <TouchableOpacity
            onPress={() => onAddToPrep(recipe)}
            style={[
              styles.button,
              isSelected ? styles.removeBtn : styles.addBtn,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                isSelected ? styles.removeBtnText : undefined,
              ]}
              allowFontScaling={false}
            >
              {isSelected ? "Remove from Prep" : "Add to Prep"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    borderWidth: 2,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedCard: {
    borderColor: "#16a34a",
  },
  unselectedCard: {
    borderColor: "#d1d5db",
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: "Inter_600SemiBold",
  },
  detail: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 2,
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: colors.brand,
  },
  removeBtn: {
    borderWidth: 2,
    borderColor: colors.brand,
    backgroundColor: "white",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
  },
  removeBtnText: {
    color: colors.brand,
    fontWeight: "700",
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
  },
  vegBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#bbf7d0", // green-200
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    zIndex: 10,
  },

  vegBadgeText: {
    color: "#166534", // green-800
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
