import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [region, setRegion] = useState("");
  const [preferredStore, setPreferredStore] = useState("");

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { signup } = useAuth();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (!region) {
      Alert.alert("Error", "Please select a region.");
      return;
    }

    /*if (!preferredStore) {
      Alert.alert("Error", "Please select a preferred store.");
      return;
    }*/

    try {
      const success = await signup(
        name,
        email,
        password,
        region,
        preferredStore
      );
      if (success) {
        Alert.alert("Success", "You are Registered!", [
          { text: "OK", onPress: () => navigation.navigate("MainApp") },
        ]);
      } else {
        Alert.alert("Signup failed", "Please try again.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Server error. Please try later.");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#d9f9fa" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 0 }}
        >
          <Ionicons name="arrow-back" size={24} color="#d95c23" />
        </TouchableOpacity>
        <Text style={styles.title} allowFontScaling={false}>
          Create an Account
        </Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Text style={styles.label}>Region</Text>
        <RNPickerSelect
          onValueChange={setRegion}
          value={region || undefined}
          placeholder={{ label: "Select a region...", value: "" }}
          useNativeAndroidPickerStyle={false}
          items={[
            { label: "Southeast", value: "Southeast" },
            { label: "Northeast", value: "Northeast" },
            { label: "Midwest", value: "Midwest" },
            { label: "Southwest", value: "Southwest" },
            { label: "West", value: "West" },
          ]}
          style={pickerSelectStyles}
          pickerProps={{
            itemStyle: {
              color: "black",
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
            },
          }}
          Icon={() =>
            Platform.OS === "ios" ? (
              <Text
                style={{ fontSize: 40, color: colors.brand, marginRight: 8 }}
                allowFontScaling={false}
              >
                ▼
              </Text>
            ) : null
          }
        />

        {/*
        <Text style={styles.label}>Preferred Store</Text>
        <RNPickerSelect
          onValueChange={setPreferredStore}
          value={preferredStore || undefined}
          placeholder={{ label: "Select a store...", value: "" }}
          useNativeAndroidPickerStyle={false}
          items={[
            { label: "Kroger", value: "Kroger" },
            { label: "Publix", value: "Publix" },
            { label: "Food Lion", value: "Food Lion" },
            { label: "Piggly Wiggly", value: "Piggly Wiggly" },
            { label: "Ingles", value: "Ingles" },
            { label: "ACME Market", value: "ACME Market" },
            { label: "Hannaford", value: "Hannaford" },
            { label: "H-E-B", value: "H-E-B" },
            { label: "Giant Food", value: "Giant Food" },
            { label: "Albertsons", value: "Albertsons" },
            { label: "Safeway", value: "Safeway" },
            { label: "Ralphs", value: "Ralphs" },
            { label: "Fred Meyer", value: "Fred Meyer" },
            { label: "Jewel-Osco", value: "Jewel-Osco" },
            { label: "Stop & Shop", value: "Stop & Shop" },
            { label: "ShopRite", value: "ShopRite" },
            { label: "King Soopers", value: "King Soopers" },
            { label: "Fry's", value: "Frys" },
            { label: "Meijer", value: "Meijer" },
            { label: "Rouses Markets", value: "Rouses" },
          ]}
          style={pickerSelectStyles}
          pickerProps={{
            itemStyle: {
              color: "black",
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
            },
          }}
          Icon={() =>
            Platform.OS === "ios" ? (
              <Text
                style={{ fontSize: 40, color: colors.brand, marginRight: 8 }}
                allowFontScaling={false}
              >
                ▼
              </Text>
            ) : null
          }
        />
        */}

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: colors.brand,
    fontFamily: "Montserrat_700Bold",
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#374151", // gray-700
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB", // gray-300
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginBottom: 15,
  },
  modalViewMiddle: {
    backgroundColor: "#e6e6e6", // Background of the picker wheel modal
  },
  modalViewBottom: {
    backgroundColor: "#e5e5e5", // Background of the toolbar area below the wheel
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginBottom: 15,
  },
});
