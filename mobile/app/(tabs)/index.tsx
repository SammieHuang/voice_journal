import { View, Button, Text,Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Header from '@/components/Header'

export default function HomeScreen() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F8F1DD",
          paddingHorizontal: 24,
          paddingTop: 16,
        }}
      >
        <Header />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 80,
          }}
        >
          <Image
            source={require("../../assets/images/backpack.png")}
            style={{
              width: 320,
              height: 320,
              resizeMode: "contain",
            }}
          />
          <View
            style={{
              width: 320,
              height: 150,
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/note-card.png")}
              style={{
                position: "absolute",
                width: 320,
                height: 150,
              }}
            />

            <Text
              style={{
                fontFamily: "SpecialElite_400Regular",
                fontSize: 22,
                color: "#3D3125",
                textAlign: "center",
              }}
            >
              No Journal Yet
            </Text>

            <Text
              style={{
                fontFamily: "SpecialElite_400Regular",
                fontSize: 13,
                color: "#7A7262",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Start your first entry!
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
}