import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePrep } from "../context/PrepContext";
import { colors } from "../theme/colors";
import { PrepConfig } from "../types/shared";
import WalkthroughPopup from "../components/WalkthroughOverlay";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";

type PrepConfigScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PrepConfig"
>;

export default function PrepConfigScreen(props: PrepConfigScreenProps) {
  const { route, navigation } = props;
  const { storeId, storeName } = route.params;

  const [numPeople, setNumPeople] = useState("1");
  const [numLunches, setNumLunches] = useState("0");
  const [numDinners, setNumDinners] = useState("0");
  const [useLeftovers, setUseLeftovers] = useState(false);
  const { user, token } = useAuth();

  const {
    setNumberOfPeople,
    setNumberOfLunches,
    setNumberOfDinners,
    setUseLeftovers: setUseLeftoversInContext,
  } = usePrep();

  const validateAndSubmit = () => {
    const people = parseInt(numPeople) || 0;
    const lunches = parseInt(numLunches) || 0;
    const dinners = parseInt(numDinners) || 0;

    if (people < 1) {
      Alert.alert("Validation Error", "Number of people must be at least 1.");
      return;
    }

    if (lunches < 0 || dinners < 0) {
      Alert.alert(
        "Validation Error",
        "Number of lunches and dinners cannot be negative."
      );
      return;
    }

    // Update context
    setNumberOfPeople(people);
    setNumberOfLunches(lunches);
    setNumberOfDinners(dinners);
    setUseLeftoversInContext(useLeftovers);

    // Create shared config object
    const prepConfig: PrepConfig = {
      numPeople: people,
      numLunches: lunches,
      numDinners: dinners,
      useLeftovers,
    };

    navigation.navigate("RecipeSelect", {
      storeId,
      storeName,
      ...prepConfig,
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#d9f9fa" }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {(user?.walkthroughEnabled || !token) && (
            <WalkthroughPopup page="prepConfig" />
          )}
          <Text style={styles.title} allowFontScaling={false}>
            Customize Your Prep - {storeName}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}># of People</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={numPeople}
              onChangeText={setNumPeople}
              maxLength={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}># of Lunches</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={numLunches}
              onChangeText={setNumLunches}
              maxLength={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}># of Dinners</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={numDinners}
              onChangeText={setNumDinners}
              maxLength={3}
            />
          </View>

          <View style={styles.switchContainer}>
            <Switch
              value={useLeftovers}
              onValueChange={setUseLeftovers}
              thumbColor={useLeftovers ? "#22c55e" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#a7f3d0" }}
            />
            <Text style={styles.switchLabel}>
              Use leftover dinner servings for lunches?
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text
                style={[styles.buttonText, styles.cancelButtonText]}
                allowFontScaling={false}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={validateAndSubmit}
            >
              <Text style={styles.buttonText} allowFontScaling={false}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.brand,
    marginBottom: 32,
    textAlign: "center",
    fontFamily: "Montserrat_700Bold",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#374151",
    fontFamily: "Montserrat_700Bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 12,
    fontSize: 18,
    color: "#111827",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  switchLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
    flex: 1,
    flexWrap: "wrap",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: colors.brand,
    backgroundColor: "white",
  },
  cancelButtonText: {
    color: colors.brand,
    fontWeight: "700",
    fontSize: 18,
  },
  continueButton: {
    backgroundColor: colors.brand,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
  },
});
