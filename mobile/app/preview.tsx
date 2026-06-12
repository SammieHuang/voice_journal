/** @format */

import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function PreviewScreen() {
  const { transcript } = useLocalSearchParams<{ transcript?: string }>();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Preview</Text>

      <View style={styles.card}>
        <Text style={styles.transcript}>
          {transcript || "No transcript found."}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.discardButton} onPress={() => router.back()}>
          <Text style={styles.discardText}>Discard</Text>
        </Pressable>

        <Pressable style={styles.saveButton} onPress={() => {}}>
          <Text style={styles.saveText}>Save Entry</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F1DD",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontFamily: "SpecialElite_400Regular",
    fontSize: 32,
    color: "#3D3125",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFF8E8",
    borderRadius: 24,
    padding: 24,
  },
  transcript: {
    color: "#3D3125",
    fontSize: 18,
    lineHeight: 28,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 24,
    marginBottom: 40,
  },
  discardButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#8A6F4D",
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: "#55624F",
    alignItems: "center",
  },
  discardText: {
    color: "#8A6F4D",
    fontSize: 16,
  },
  saveText: {
    color: "#F8F1DD",
    fontSize: 16,
  },
});
