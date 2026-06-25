import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fonts} from "@/constants/theme";

export default function Header() {
  return (
    <View>
      <Text
        style={styles.header}
      >
        VOICE JOURNAL
      </Text>
      <Text
        style={styles.subheader}
      >
        Record your thoughts, become a better you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: fonts.backpack,
    fontSize: spacing.xl,
    lineHeight: 38,
    color: colors.header,
  },
  subheader: {
    fontFamily: fonts.backpack,
    fontSize: 12,
    lineHeight: 18,
    color: colors.subheader,
    marginTop: 6,
    maxWidth: 300,
  },
});