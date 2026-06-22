/** @format */

import { Pressable, StyleSheet, Text, View} from "react-native";
import { Ionicons } from "@expo/vector-icons";


type JournalHeaderProps = {
    onBack: () => void
    createdAt: string
}

export const formatTimeStamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second:'2-digit'
    })
}
export default function JournalHeader({ onBack, createdAt }: JournalHeaderProps) {
    return (
      <View>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#8A6F4D" />
          <Text style={styles.backText}>Journals</Text>
        </Pressable>

        {createdAt && (
          <Text style={styles.date}>
            {formatTimeStamp(createdAt)}
          </Text>
        )}
      </View>
    );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backText: {
    color: "#8A6F4D",
    fontSize: 18,
    marginLeft: 4,
    fontFamily: "SpecialElite_400Regular",
  },

  date: {
    color: "#8A6F4D",
    fontSize: 16,
    marginBottom: 24,
  },
});