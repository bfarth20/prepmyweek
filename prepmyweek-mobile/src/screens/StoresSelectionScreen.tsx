import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import WalkthroughPopup from "../components/WalkthroughOverlay";
import { colors } from "../theme/colors";
import API_BASE_URL from "../utils/config";
import axios from "axios";

type Store = {
  id: number;
  name: string;
};

const GENERIC_STORES: Store[] = [
  { id: 1, name: "Regional Supermarket" },
  { id: 2, name: "Korean Grocery Store" },
  { id: 3, name: "Discount Mega Store" },
  { id: 5, name: "National Organic Grocer" },
  { id: 7, name: "Mexican Grocery Store" },
  { id: 8, name: "Discount German Chain Grocer" },
  { id: 9, name: "Wine, Cheese, and No Parking" },
  { id: 10, name: "Upscale German Chain Grocer" },
];

export default function StoresSelectionScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, token } = useAuth();

  const [stores, setStores] = useState<Store[]>(GENERIC_STORES);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setStores(GENERIC_STORES);
        return;
      }

      const fetchCustomStores = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/users/custom-stores`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const personalizedStoreNames = res.data;
          const updatedStores = GENERIC_STORES.map((store) => {
            const customName = personalizedStoreNames?.[store.id.toString()];
            return {
              ...store,
              name:
                customName && customName.trim() !== ""
                  ? customName
                  : store.name,
            };
          });

          setStores(updatedStores);
        } catch (error) {
          console.error("Failed to fetch personalized store names", error);
          setStores(GENERIC_STORES);
        }
      };

      fetchCustomStores();
    }, [token])
  );

  const handleStoreSelect = (store: Store) => {
    navigation.navigate("PrepConfig", {
      storeId: store.id,
      storeName: store.name,
    });
  };

  const renderStore = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleStoreSelect(item)}
    >
      {/* No logo here, just store name */}
      <Text style={styles.storeName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {!token && <WalkthroughPopup page="storesGuest" />}
      {user?.walkthroughEnabled && <WalkthroughPopup page="stores" />}

      <Text style={styles.title} allowFontScaling={false}>
        StartMyPrep
      </Text>
      <Text style={styles.subtitle} allowFontScaling={false}>
        Select your store
      </Text>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStore}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: colors.background },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.brand,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 16,
  },
  listContainer: {
    paddingTop: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    flexDirection: "column",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logo: {
    width: 90,
    height: 30,
    resizeMode: "contain",
  },
  noLogo: {
    width: 60,
    height: 60,
    backgroundColor: "#d1d5db",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  noLogoText: {
    fontSize: 12,
    color: "#6b7280",
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.brand,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
