import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../utils/config";
import { colors } from "../theme/colors";
import WalkthroughPopup from "../components/WalkthroughOverlay";

type StoreItem = {
  storeId: number;
  defaultName: string;
  customName: string;
};

const DEFAULT_STORES: StoreItem[] = [
  { storeId: 1, defaultName: "Local Chain Grocer", customName: "" },
  { storeId: 2, defaultName: "Korean Grocery Store", customName: "" },
  { storeId: 3, defaultName: "Discount Mega Store", customName: "" },
  { storeId: 5, defaultName: "National Organic Grocer", customName: "" },
  { storeId: 7, defaultName: "Mexican Grocery Store", customName: "" },
  { storeId: 8, defaultName: "Discount German Chain Grocer", customName: "" },
  { storeId: 9, defaultName: "Wine, Cheese, and No Parking", customName: "" },
  { storeId: 10, defaultName: "Upscale German Chain Grocer", customName: "" },
];

export default function PersonalizeStoresScreen() {
  const { user, token } = useAuth();
  const [stores, setStores] = useState<StoreItem[]>(DEFAULT_STORES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchCustomStores = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/custom-stores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Map returned data to default store list
        const updatedStores = DEFAULT_STORES.map((store) => {
          const customName = res.data?.[store.storeId.toString()];
          return {
            ...store,
            customName:
              customName && customName.trim() !== ""
                ? customName
                : store.defaultName,
          };
        });

        setStores(updatedStores);
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to load your personalized store names. Showing defaults."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomStores();
  }, [token]);

  const handleChange = (storeId: number, newName: string) => {
    setStores((prev) =>
      prev.map((s) =>
        s.storeId === storeId ? { ...s, customName: newName } : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/users/custom-stores`,
        {
          personalizedStoreNames: stores.reduce(
            (acc, { storeId, customName }) => {
              acc[storeId] = customName;
              return acc;
            },
            {} as Record<number, string>
          ),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "Your personalized store names have been saved.");
    } catch (error) {
      Alert.alert("Error", "Failed to save personalized store names.");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {user?.walkthroughEnabled && (
            <WalkthroughPopup page="personalizeStores" />
          )}
          <Text style={styles.title}>Personalize Store Names</Text>
          <Text style={styles.subtitle}>
            Edit the store names shown in the app. Leave blank to use default.
          </Text>

          {stores.map(({ storeId, defaultName, customName }) => (
            <View key={storeId} style={styles.inputGroup}>
              <Text style={styles.label}>
                {customName.trim() !== "" ? customName : defaultName}
              </Text>
              <TextInput
                style={styles.input}
                value={customName}
                placeholder={`Custom name for "${defaultName}"`}
                onChangeText={(text) => handleChange(storeId, text)}
                maxLength={30}
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.brand,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.brand,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#cccccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333333",
  },
  button: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#999999",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
