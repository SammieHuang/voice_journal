import { View, Text } from "react-native";

export default function Header() {
  return (
    <View>
      <Text
        style={{
          fontFamily: "SpecialElite_400Regular",
          fontSize: 32,
          lineHeight: 38,
          color: "#3D3125",
        }}
      >
        VOICE JOURNAL
      </Text>

      <Text
        style={{
          fontFamily: "SpecialElite_400Regular",
          fontSize: 12,
          lineHeight: 18,
          color: "#8F8978",
          marginTop: 6,
          maxWidth: 300,
        }}
      >
        Record your thoughts, become a better you.
      </Text>
    </View>
  );
}
