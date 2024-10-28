import { StyleSheet } from "react-native"

import EditScreenInfo from "@/src/components/EditScreenInfo"
import { Text, View } from "@/src/components/Themed"
import { SafeAreaView } from "react-native-safe-area-context"

export default function TabOneScreen() {
  return (
    <SafeAreaView>
      <View className="flex-1 items-center justify-center">
        <Text style={styles.title}>Tab One</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <EditScreenInfo path="app/(tabs)/index.tsx" />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
})
