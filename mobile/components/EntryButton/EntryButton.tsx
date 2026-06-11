import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native";

type EntryButtonProps = {
    // label: string;
    // onPress: () => void | Promise<void>
    // variant: 'record' | 'stop' | 'transcribe'
}

const EntryButton = () => {
    return (
        <Pressable>
            <Text> </Text>
        </Pressable>
    )

}


export const styles = StyleSheet.create({
  stop: {
    marginTop: 60,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9B3D30",
  },
  record: {
    marginTop: 60,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#55624F",
  },
  transcribe: {
    marginTop: 60,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8A6F4D",
  },
  text: {
    color: "#F8F1DD",
    fontSize: 18,
  },
});

export default EntryButton