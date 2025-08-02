import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WalkthroughPopupProps {
  page: string;
  onDismiss?: () => void;
}

const walkthroughMessages: Record<string, string> = {
  home: 'Welcome! Start your meal prep by selecting "Start a FreshPrep". Looking for more features like favorite recipes, adding recipes, or saving preps? Check out the full app on prepmyweek.com. If you’re tired of seeing these popups and already know how the app works, toggle Walkthrough Mode off from the settings page. You can turn it back on any time!',
  stores:
    "Start by choosing your preferred grocery store\n\nIf you want to personalize the store names, you can do so in settings.",
  prepConfig:
    "Set how many people you're shopping for, how many lunches and dinners you want to prep, and whether to use dinner leftovers for lunch. If you're not sure, feel free to leave the default settings as they are.",
  storesRecipes:
    "On this page, you can browse and select recipes to add to your weekly plan. Use the filters or sort features to find the perfect recipe, or search my title or ingredient! Click on any recipe card to explore the details. As you make selections, you’ll see your total servings update automatically. If you’ve set a required number of lunches and dinners, a new button will appear once your goals are met to take you to your completed prep.",
  recipeDetail:
    "This is the recipe detail page. If you’d like to add it to your prep, just tap the button at the bottom. Use the back button to return to the store’s recipe list.",
  finishedPrep:
    "You’ve successfully built your weekly meal plan! If you’re happy with your selections and want to use them throughout the week, make sure to set this as your CurrentPrep. That way, you can come back anytime to view your recipes and grocery list—right from your homepage.",
  grocerylist:
    "Welcome to your grocery list! All ingredients from your selected recipes have been combined and sorted by grocery store section for easy shopping. Feel free to add extra items like snacks, drinks, or household supplies at the bottom of the list.",
  currentPrep:
    "Congratulations! You’ve successfully saved a CurrentPrep. You can return to this page any time this week to view your selected recipes or access your grocery list.",
  homeGuest: `Start your meal prep by selecting "Start a FreshPrep".\n\nLooking for more features like saving your selections to use all week and getting a categorized grocery list from your recipes?\n\nSign up for full access!`,
  storesGuest: `Start by choosing your preferred grocery store.`,
  finalizedGuest: `You’ve successfully made a prep!\n\nSign up to save these recipes to your account for easy access all week, plus get an organized grocery list of all the ingredients you’ll need.`,
  personalizeStores: `On this page you can personalize the names of each store! For suggested store names, check out your account on prepmyweek.com or use whatever store you would like.`,
};

const screenHeight = Dimensions.get("window").height;

export default function WalkthroughPopup({
  page,
  onDismiss,
}: WalkthroughPopupProps) {
  const [visible, setVisible] = useState(true);
  const message = walkthroughMessages[page] || "Welcome to PrepMyWeek!";

  useEffect(() => {
    setVisible(true);
  }, [page]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            onPress={() => {
              setVisible(false);
              onDismiss?.();
            }}
          >
            <Text style={styles.dismiss}>Got it</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10000,
    elevation: 10,
    paddingHorizontal: 16,
  },
  popup: {
    maxWidth: 360,
    width: "100%",
    maxHeight: screenHeight * 0.6,
    backgroundColor: "white",
    borderRadius: 12,
    borderColor: "#d95c23",
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  message: {
    color: "#333",
    fontSize: 14,
    marginBottom: 10,
  },
  dismiss: {
    fontSize: 14,
    color: "#007aff",
    fontWeight: "500",
    alignSelf: "flex-end",
  },
});
