import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { usePrep } from "../context/PrepContext";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme/colors";

export function PrepTracker() {
  const navigation = useNavigation();

  const {
    selectedDinners,
    selectedLunches,
    numberOfPeople,
    numberOfDinners,
    numberOfLunches,
    useLeftovers,
    clearPrep,
  } = usePrep();

  const [minimized, setMinimized] = useState(false);

  const people = numberOfPeople || 1;
  const numDinners = numberOfDinners || 0;
  const numLunches = numberOfLunches || 0;

  const totalDinnerServingsNeeded = people * numDinners;
  const totalLunchServingsNeeded = people * numLunches;

  // Count only people servings per dinner recipe
  const dinnerServingsSelected = selectedDinners.length * people;

  // Count leftover lunch servings from dinners
  const leftoverLunchServings = useLeftovers
    ? selectedDinners.reduce((sum, recipe) => {
        const totalServings = recipe.servings || 0;
        const leftover = totalServings - people;
        return sum + Math.max(0, leftover);
      }, 0)
    : 0;

  const lunchServingsFromRecipes = selectedLunches.reduce(
    (sum, recipe) => sum + (recipe.servings || 0),
    0
  );

  const totalLunchServingsCounted =
    lunchServingsFromRecipes + leftoverLunchServings;

  const dinnersRemaining = Math.max(
    0,
    totalDinnerServingsNeeded - dinnerServingsSelected
  );
  const lunchesRemaining = Math.max(
    0,
    totalLunchServingsNeeded - totalLunchServingsCounted
  );

  const prepComplete = dinnersRemaining === 0 && lunchesRemaining === 0;

  const handleGoToSummary = () => {
    navigation.navigate("FinalizePrep" as never);
  };

  const handleResetPrep = () => {
    clearPrep();
    navigation.navigate("Stores" as never);
  };

  return (
    <View style={[styles.container, minimized && styles.minimized]}>
      {/* Header with minimize toggle */}
      <View style={styles.header}>
        {!minimized ? (
          <Text style={styles.title} allowFontScaling={false}>
            Prep Progress
          </Text>
        ) : (
          <Text style={styles.statusText} allowFontScaling={false}>
            {dinnerServingsSelected} / {totalDinnerServingsNeeded}
          </Text>
        )}

        <TouchableOpacity
          accessibilityLabel={
            minimized ? "Maximize prep progress" : "Minimize prep progress"
          }
          onPress={() => setMinimized(!minimized)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleButtonText} allowFontScaling={false}>
            {minimized ? "➕" : "➖"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Text */}
      {!minimized && (
        <>
          <Text style={styles.statusText} allowFontScaling={false}>
            {dinnerServingsSelected} / {totalDinnerServingsNeeded} dinners
          </Text>
          <Text style={styles.statusText} allowFontScaling={false}>
            {totalLunchServingsCounted} / {totalLunchServingsNeeded} lunches
          </Text>
          {useLeftovers && (
            <Text style={styles.leftoverText}>
              Includes {leftoverLunchServings} leftover lunches
            </Text>
          )}
        </>
      )}

      {/* Buttons */}
      <TouchableOpacity style={styles.resetButton} onPress={handleResetPrep}>
        <Text style={styles.resetButtonText} allowFontScaling={false}>
          Reset Prep
        </Text>
      </TouchableOpacity>

      {prepComplete && (
        <TouchableOpacity
          style={styles.finishedButton}
          onPress={handleGoToSummary}
        >
          <Text style={styles.finishedButtonText} allowFontScaling={false}>
            Finished Prep
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 7,
    borderRadius: 12,
    width: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10, // Increase elevation on Android
    zIndex: 9999,
  },
  minimized: {
    width: 90,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontWeight: "700",
    fontSize: 14,
  },
  invisible: {
    opacity: 0,
  },
  toggleButton: {
    paddingHorizontal: 0,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toggleButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    marginVertical: 2,
  },
  leftoverText: {
    fontSize: 10,
    color: "#6b7280", // gray-500
  },
  resetButton: {
    backgroundColor: "#fff", // gray-200
    paddingVertical: 4,
    marginTop: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.brand,
  },
  resetButtonText: {
    fontSize: 12,
    color: colors.brand,
    textAlign: "center",
    fontWeight: "600",
  },
  finishedButton: {
    backgroundColor: "#34cd34", // green-600
    paddingVertical: 4,
    marginTop: 6,
    borderRadius: 6,
  },
  finishedButtonText: {
    fontSize: 12,
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});
