/** @format */

import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type EmptyJournalsStateProps = {
  onStartRecording: () => void;
};

export function EmptyJournalsState({
  onStartRecording,
}: EmptyJournalsStateProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/backpack.png")}
        style={styles.backpack}
        resizeMode="contain"
      />

      <View style={styles.noteWrapper}>
        <Image
          source={require("@/assets/images/note-card.png")}
          style={styles.noteCard}
          resizeMode="contain"
        />

        <View style={styles.noteTextWrapper}>
          <Text style={styles.noteTitle}>Every story starts somewhere.</Text>
          <Text style={styles.noteSubtitle}>Record your first entry！</Text>
        </View>
      </View>

      <Pressable style={styles.button} onPress={onStartRecording}>
        <Text style={styles.buttonText}>Start Recording</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  backpack: {
    width: 300,
    height: 300,
  },

  noteWrapper: {
    width: 350,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    //marginBottom: 24,
  },

  noteCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  noteTextWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },

  noteTitle: {
    fontFamily: "SpecialElite_400Regular",
    color: "#3D3125",
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
    marginBottom: 4,
  },

  noteSubtitle: {
    fontFamily: "SpecialElite_400Regular",
    color: "#3D3125",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#3D3125",
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 999,
  },

  buttonText: {
    color: "#F8F1DD",
    fontSize: 16,
    fontWeight: "700",
  },
});
