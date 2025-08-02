import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { usePrep } from "../context/PrepContext";
import { RecipeSummary } from "../types/shared";
import { RootStackParamList } from "../navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { PrepTracker } from "../components/PrepTracker";
import axios from "axios";
import API_BASE_URL from "../utils/config";
import RecipeCard from "../components/RecipeCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import WalkthroughPopup from "../components/WalkthroughOverlay";

type Props = NativeStackScreenProps<RootStackParamList, "RecipeSelect">;
type SortOption = "newest" | "ingredients" | "cookTime";
type FilterOption = "all" | "dinner" | "lunch" | "vegetarian";

export default function RecipeSelectScreen({ route }: Props) {
  const { storeId, storeName } = route.params;
  const navigation = useNavigation();
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, token } = useAuth();
  const [storeDisplayName, setStoreDisplayName] = useState("");
  const GENERIC_STORES = [
    { id: 1, name: "Regional Supermarket" },
    { id: 2, name: "Korean Grocery Store" },
    { id: 3, name: "Discount Mega Store" },
    { id: 5, name: "National Organic Grocer" },
    { id: 7, name: "Mexican Grocery Store" },
    { id: 8, name: "Discount German Chain Grocer" },
    { id: 9, name: "Wine, Cheese, and No Parking" },
    { id: 10, name: "Upscale German Chain Grocer" },
  ];

  useEffect(() => {
    const fetchStoreName = async () => {
      const baseStore = GENERIC_STORES.find((s) => s.id === storeId);
      if (!token) {
        setStoreDisplayName(baseStore?.name || "Selected Store");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/users/custom-stores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const customName = res.data?.[storeId.toString()];
        const finalName =
          customName && customName.trim() !== "" ? customName : baseStore?.name;

        setStoreDisplayName(finalName || "Selected Store");
      } catch (err) {
        console.error("Failed to fetch store name", err);
        setStoreDisplayName(baseStore?.name || "Selected Store");
      }
    };

    fetchStoreName();
  }, [storeId, token]);

  const {
    selectedDinners,
    selectedLunches,
    selectedRecipes,
    addDinner,
    removeDinner,
    addLunch,
    removeLunch,
    addRecipe,
    removeRecipe,
  } = usePrep();

  const selectedIds = selectedRecipes.map((r) => r.id);

  // Pagination and data state
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    // Reset when storeId changes
    setRecipes([]);
    setPage(1);
    setTotalPages(1);
    fetchRecipes(1, searchTerm.trim(), filter, sortOption);
  }, [storeId, filter, sortOption]);

  const handleSearchSubmit = () => {
    setRecipes([]);
    setPage(1);
    setTotalPages(1);
    fetchRecipes(1, searchTerm.trim(), filter, sortOption);
  };

  const fetchRecipes = async (
    pageToFetch: number,
    search: string = "",
    filterVal: FilterOption = "all",
    sortVal: SortOption = "newest"
  ) => {
    if (pageToFetch > totalPages) return;

    if (pageToFetch === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/stores/${storeId}/recipes`, {
        params: {
          page: pageToFetch,
          limit,
          search,
          filter: filterVal,
          sort: sortVal,
        },
      });

      const newRecipes = res.data.data ?? res.data;

      if (pageToFetch === 1) {
        setRecipes(newRecipes);
      } else {
        setRecipes((prev) => [...prev, ...newRecipes]);
      }

      setTotalPages(res.data.pagination.totalPages);
      setPage(pageToFetch);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleAddOrRemove = (recipe: RecipeSummary) => {
    const isSelected = selectedIds.includes(recipe.id);

    // Always update the general selection
    isSelected ? removeRecipe(recipe.id) : addRecipe(recipe);

    // Only update PrepTracker state for LUNCH and DINNER
    if (recipe.course === "LUNCH") {
      isSelected ? removeLunch(recipe.id) : addLunch(recipe);
    } else if (recipe.course === "DINNER") {
      isSelected ? removeDinner(recipe.id) : addDinner(recipe);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    if (filter === "all") return true;
    if (filter === "vegetarian") return recipe.isVegetarian;
    if (filter === "dinner") return recipe.course === "DINNER";
    if (filter === "lunch") return recipe.course === "LUNCH";
    return true;
  });

  const sortedRecipes = filteredRecipes.sort((a, b) => {
    if (sortOption === "newest") {
      const toDate = (dateStr?: string) =>
        dateStr ? new Date(dateStr.replace(" ", "T")) : new Date(0);
      return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
    }
    if (sortOption === "ingredients") {
      return (a.ingredientCount ?? 0) - (b.ingredientCount ?? 0);
    }
    if (sortOption === "cookTime") {
      return (a.totalTime ?? 0) - (b.totalTime ?? 0);
    }
    return 0;
  });

  const handleLoadMore = () => {
    if (loadingMore || loading) return;
    if (page >= totalPages) return;
    fetchRecipes(page + 1);
  };

  if (loading && recipes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text>Loading recipes...</Text>
      </View>
    );
  }

  if (error && recipes.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          position: "relative",
          backgroundColor: colors.background,
        }}
        edges={["top", "left", "right"]}
      >
        {(user?.walkthroughEnabled || !token) && (
          <WalkthroughPopup page="storesRecipes" />
        )}
        <PrepTracker />

        <View style={styles.container}>
          <Text style={styles.title} allowFontScaling={false}>
            Recipes at {storeDisplayName}
          </Text>

          <FlatList
            data={sortedRecipes}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                isSelected={selectedIds.includes(item.id)}
                onAddToPrep={handleAddOrRemove}
                showPrepTracker={true}
              />
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator color={colors.brand} />
                </View>
              ) : null
            }
          />
        </View>

        <View style={styles.filterSortContainer}>
          <View style={styles.row}>
            {["all", "dinner", "lunch", "vegetarian"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  filter === type && styles.activeButton,
                ]}
                onPress={() => setFilter(type as FilterOption)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === type && styles.activeButtonText,
                  ]}
                  allowFontScaling={false}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            {["newest", "ingredients", "cookTime"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  sortOption === type && styles.activeButton,
                ]}
                onPress={() => setSortOption(type as SortOption)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    sortOption === type && styles.activeButtonText,
                  ]}
                  allowFontScaling={false}
                >
                  {type === "cookTime"
                    ? "Quickest"
                    : type === "ingredients"
                    ? "Simplest"
                    : "Newest"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            clearButtonMode="while-editing"
            onSubmitEditing={handleSearchSubmit}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            blurOnSubmit={true}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: 12,
    paddingLeft: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.brand,
    fontFamily: "Montserrat_700Bold",
  },
  listContent: {
    paddingBottom: 100,
  },
  filterSortContainer: {
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(217, 249, 250, 0.8)",
    zIndex: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: colors.brand,
  },
  activeButton: {
    backgroundColor: colors.brand,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  activeButtonText: {
    color: "white",
  },
  searchInput: {
    height: 40,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
});
