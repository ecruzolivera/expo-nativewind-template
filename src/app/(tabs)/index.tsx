import { Text, View, StyleSheet } from "react-native"

import { SafeAreaView } from "react-native-safe-area-context"

export default function TabOneScreen() {
  return (
    <SafeAreaView>
      <View className="flex-1 items-center justify-center">
        <Text style={styles.title}>Tab One</Text>
        <View style={styles.separator} />
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
