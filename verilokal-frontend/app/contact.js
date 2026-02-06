import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function Contact() {
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.section, { minHeight: height }]}>
      <View style={{ maxWidth: 700 }}>
        <Text style={styles.title}>Contact</Text>
        <Text style={styles.text}>Email: support@yourapp.com</Text>
        <Text style={styles.text}>Phone: +63 900 000 0000</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f8f9fb",
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
    marginBottom: 8,
  },
});
