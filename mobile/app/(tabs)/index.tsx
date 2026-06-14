/** @format */

// import { View, Button, Text,Image } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'

// import Header from '@/components/Header'

// export default function HomeScreen() {
//     return (
//       <SafeAreaView
//         style={{
//           flex: 1,
//           backgroundColor: "#F8F1DD",
//           paddingHorizontal: 24,
//           paddingTop: 16,
//         }}
//       >
//         <Header />
//         <View
//           style={{
//             flex: 1,
//             alignItems: "center",
//             justifyContent: "center",
//             paddingBottom: 80,
//           }}
//         >
//           <Image
//             source={require("../../assets/images/backpack.png")}
//             style={{
//               width: 320,
//               height: 320,
//               resizeMode: "contain",
//             }}
//           />
//           <View
//             style={{
//               width: 320,
//               height: 150,
//               alignSelf: "center",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Image
//               source={require("../../assets/images/note-card.png")}
//               style={{
//                 position: "absolute",
//                 width: 320,
//                 height: 150,
//               }}
//             />

//             <Text
//               style={{
//                 fontFamily: "SpecialElite_400Regular",
//                 fontSize: 22,
//                 color: "#3D3125",
//                 textAlign: "center",
//               }}
//             >
//               No Journal Yet
//             </Text>

//             <Text
//               style={{
//                 fontFamily: "SpecialElite_400Regular",
//                 fontSize: 13,
//                 color: "#7A7262",
//                 textAlign: "center",
//                 marginTop: 8,
//               }}
//             >
//               Start your first entry!
//             </Text>
//           </View>
//         </View>
//       </SafeAreaView>
//     );
// }

import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { getJournals } from "@/services/journal-service";
import { Journal } from "@/types/journal";

export default function JournalsScreen() {
  const [journals, setJournals] = useState<Journal[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadJournals = async () => {
        const savedJournals = await getJournals();
        setJournals(savedJournals);
      };

      loadJournals();
    }, []),
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Journals</Text>

      <FlatList
        data={journals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No journals yet.</Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/journal/${item.id}`)}>
            <View style={styles.card}>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.transcript} numberOfLines={3}>
                {item.transcript}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F1DD",
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  title: {
    fontFamily: "SpecialElite_400Regular",
    fontSize: 32,
    color: "#3D3125",
    marginBottom: 24,
  },
  list: {
    paddingBottom: 120,
  },
  emptyText: {
    color: "#8A6F4D",
    fontSize: 18,
    textAlign: "center",
    marginTop: 80,
  },
  card: {
    backgroundColor: "#FFF8E8",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  date: {
    color: "#8A6F4D",
    fontSize: 14,
    marginBottom: 8,
  },
  transcript: {
    color: "#3D3125",
    fontSize: 16,
    lineHeight: 24,
  },
});
