import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function AboutMe() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={[styles.section, { minHeight: height }]}>
      <View style={{ maxWidth: 700 }}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.text}>
          We are dedicated to protecting Filipino craftsmanship by combining
          traditional artistry with modern blockchain verification.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 36,
    fontFamily: "Montserrat-Bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: "Garet-Book",
    textAlign: "center",
  },
});
