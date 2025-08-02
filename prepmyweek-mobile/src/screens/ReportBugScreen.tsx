import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "../utils/config";
import { colors } from "../theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const FEEDBACK_TYPES = [
  "Bug",
  "FeatureRequest",
  "StoreRequest",
  "Other",
] as const;

export default function ReportBugScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [type, setType] = useState<(typeof FEEDBACK_TYPES)[number]>("Bug");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Please enter a message.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/feedback`,
        { type, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Feedback submitted", "Thanks for the feedback!");
      navigation.goBack(); // go back to settings or previous screen
    } catch (error) {
      console.error("Feedback submission error:", error);
      Alert.alert("Error", "Could not submit feedback. Try again later.");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#d9f9fa" }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Submit Feedback</Text>

          <Text style={styles.label}>Feedback Type</Text>
          <View style={styles.typeContainer}>
            {FEEDBACK_TYPES.map((ft) => (
              <TouchableOpacity
                key={ft}
                style={[
                  styles.typeOption,
                  type === ft && styles.selectedTypeOption,
                ]}
                onPress={() => setType(ft)}
              >
                <Text
                  style={
                    type === ft ? styles.selectedTypeText : styles.typeText
                  }
                >
                  {ft}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your bug, request, or feedback..."
            multiline
            numberOfLines={6}
            style={styles.textArea}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.button, { marginTop: 20 }]}
            disabled={!message.trim()}
          >
            <Text style={styles.buttonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#d95c23",
    marginBottom: 24,
    fontFamily: "Montserrat_700Bold",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  typeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTypeOption: {
    backgroundColor: colors.brand,
  },
  typeText: {
    color: "#333",
  },
  selectedTypeText: {
    color: "white",
    fontWeight: "600",
  },
  textArea: {
    height: 120,
    backgroundColor: "white",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colors.brand,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
