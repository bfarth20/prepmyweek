import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  checked: boolean;
  onToggle: () => void;
};

export default function Checkbox({ checked, onToggle }: Props) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.touchArea}>
      <View style={[styles.checkboxBase, checked && styles.checkboxChecked]}>
        {checked && <Feather name="check" size={16} color="white" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    padding: 4,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 12, // circle
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#d95c23",
    borderColor: "#d95c23",
  },
});
