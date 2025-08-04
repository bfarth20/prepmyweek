import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState, useRef } from "react";
import {
  KeyboardAvoidingView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { usePrep } from "../context/PrepContext";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../utils/config";
import axios from "axios";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import Checkbox from "../components/Checkbox";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import WalkthroughPopup from "../components/WalkthroughOverlay";

type Props = BottomTabScreenProps<MainTabParamList, "GroceryList">;

type Ingredient = {
  id: number;
  name: string;
  quantity: string | number;
  unit?: string;
  section?: string;
};

export default function GroceryListScreen({ route, navigation }: Props) {
  const { clearPrep } = usePrep();
  const { user, token } = useAuth();
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [groupedIngredients, setGroupedIngredients] = useState<
    Map<string, Ingredient[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const [customItems, setCustomItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [customItemChecks, setCustomItemChecks] = useState<
    Record<string, boolean>
  >({});
  const STORAGE_KEYS = {
    CUSTOM_ITEMS: "customItems",
    CUSTOM_CHECKS: "customItemChecks",
    CHECKED_ITEMS: "checkedItems",
  };

  async function saveData<T>(key: string, data: T) {
    try {
      const json = JSON.stringify(data);
      await SecureStore.setItemAsync(key, json);
    } catch (e) {
      console.error(`❌ Error saving "${key}":`, e);
    }
  }

  async function loadData<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const json = await SecureStore.getItemAsync(key);
      return json ? (JSON.parse(json) as T) : defaultValue;
    } catch (e) {
      console.error(`❌ Error loading ${key}:`, e);
      return defaultValue;
    }
  }

  useEffect(() => {
    async function loadLocalData() {
      if (!token) return;

      const savedCustomItems = await loadData<string[]>(
        STORAGE_KEYS.CUSTOM_ITEMS,
        []
      );
      const savedCustomChecks = await loadData<Record<string, boolean>>(
        STORAGE_KEYS.CUSTOM_CHECKS,
        {}
      );
      const savedCheckedItems = await loadData<number[]>(
        STORAGE_KEYS.CHECKED_ITEMS,
        []
      );

      setCustomItems(savedCustomItems);
      setCustomItemChecks(savedCustomChecks);
      setCheckedItems(savedCheckedItems);
      hasLoadedRef.current = true;
    }

    loadLocalData();
  }, [token]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveData(STORAGE_KEYS.CUSTOM_ITEMS, customItems);
  }, [customItems]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveData(STORAGE_KEYS.CUSTOM_CHECKS, customItemChecks);
  }, [customItemChecks]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveData(STORAGE_KEYS.CHECKED_ITEMS, checkedItems);
  }, [checkedItems]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchGroceryList = async () => {
        if (!token) {
          if (isActive) {
            setError("You must be logged in to view your grocery list.");
            setLoading(false);
          }
          return;
        }

        setLoading(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/current-prep`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const recipeIds = res.data.data.recipes.map((r: any) => r.id);
          const groceryRes = await axios.post(
            `${API_BASE_URL}/grocery-list`,
            {
              recipeIds,
              preferMetric: user?.preferMetric ?? false,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (isActive) {
            const groceryList = new Map<string, Ingredient[]>(
              Object.entries(groceryRes.data.groceryList)
            );
            setGroupedIngredients(groceryList);
            setError(null);
          }
        } catch (err) {
          console.error("❌ Error fetching grocery list:", err);
          if (isActive) {
            setError("Failed to load grocery list.");
          }
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchGroceryList();

      return () => {
        isActive = false;
      };
    }, [token, user?.preferMetric])
  );

  const toggleItem = (id: number) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addCustomItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (customItems.includes(trimmed)) {
      Alert.alert("Item already added");
      return;
    }
    setCustomItems([...customItems, trimmed]);
    setCustomItemChecks({ ...customItemChecks, [trimmed]: true });
    setNewItem("");
  };

  const removeCustomItem = (item: string) => {
    setCustomItems(customItems.filter((i) => i !== item));
    const newChecks = { ...customItemChecks };
    delete newChecks[item];
    setCustomItemChecks(newChecks);
  };

  const toggleCustomItemChecked = (item: string) => {
    setCustomItemChecks({
      ...customItemChecks,
      [item]: !customItemChecks[item],
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text>Loading grocery list...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  if (groupedIngredients.size === 0) {
    return (
      <View style={styles.center}>
        <Text>No recipes selected yet.</Text>
        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => navigation.navigate("Stores")}
        >
          <Text style={styles.buttonOutlineText}>Start a Prep</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#d9f9fa" }}
        edges={["top", "left", "right"]}
      >
        {user?.walkthroughEnabled && <WalkthroughPopup page="grocerylist" />}

        <ScrollView style={styles.container}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Grocery List</Text>
            </View>

            {Array.from(groupedIngredients.entries()).map(
              ([section, items]) => (
                <View key={section} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section}</Text>
                  {items.map((ingredient) => {
                    const key = `${ingredient.id}-${ingredient.unit}`;
                    const label = `${ingredient.quantity} ${
                      ingredient.unit ?? ""
                    } ${ingredient.name}`;

                    return (
                      <View
                        key={`${ingredient.id}-${ingredient.unit}`}
                        style={styles.ingredientRow}
                      >
                        <Checkbox
                          checked={checkedItems.includes(ingredient.id)}
                          onToggle={() => toggleItem(ingredient.id)}
                        />
                        <Text style={styles.ingredientText}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
              )
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add to Shopping List?</Text>
              {customItems.map((item) => (
                <View key={item} style={styles.customItemRow}>
                  <Checkbox
                    checked={!!customItemChecks[item]}
                    onToggle={() => toggleCustomItemChecked(item)}
                  />
                  <Text style={styles.ingredientText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeCustomItem(item)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addItemRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Add custom item..."
                  value={newItem}
                  onChangeText={setNewItem}
                />
                <TouchableOpacity style={styles.button} onPress={addCustomItem}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 16,
    color: colors.brand,
    fontFamily: "Montserrat_700Bold",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: "#f97316",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonOutlineText: { color: "#f97316", fontWeight: "600" },
  section: { marginVertical: 12 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.brand,
    fontFamily: "Montserrat_700Bold",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ingredientText: { fontSize: 16, marginLeft: 8 },
  customItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    justifyContent: "space-between",
  },
  removeText: { color: "red", fontWeight: "600", marginLeft: 10 },
  addItemRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
  },
  button: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 6,
    marginLeft: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
