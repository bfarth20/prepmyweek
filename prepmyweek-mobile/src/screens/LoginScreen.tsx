import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      navigation.replace("MainApp");
    } else {
      Alert.alert(
        "Login Failed",
        "Invalid email or password. Please try again."
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Welcome")}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logoNoBg.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title} allowFontScaling={false}>
              PrepMyWeek
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.heading} allowFontScaling={false}>
              Log In
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label} allowFontScaling={true}>
                Email Address
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>
                Forgot your Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText} allowFontScaling={false}>
                Log In
              </Text>
            </TouchableOpacity>

            <View style={styles.signupTextContainer}>
              <Text style={styles.signupText} allowFontScaling={false}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.signupLink} allowFontScaling={false}>
                  Create one
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, // matches your bg-color-background
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 16 },
  backButton: { marginBottom: 12 },
  backButtonText: { color: "#007aff", fontSize: 16 },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  logo: { width: 80, height: 80, marginBottom: 8 },
  title: {
    fontSize: 32,
    color: colors.brand,
    fontFamily: "Montserrat_700Bold",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  heading: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Montserrat_700Bold",
    color: colors.brand,
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
  },
  forgotPasswordButton: { alignSelf: "flex-end", marginBottom: 16 },
  forgotPasswordText: { color: colors.brand, fontSize: 14, fontWeight: "500" },
  loginButton: {
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  loginButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
  signupTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  signupText: { textAlign: "center", fontSize: 14, color: "#6b7280" },
  signupLink: { color: colors.brand, fontWeight: "600" },
});
