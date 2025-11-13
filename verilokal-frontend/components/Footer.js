import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.copyright}>
        © {new Date().getFullYear()} VeriLokal
      </Text>

      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => Linking.openURL("https://facebook.com")}>
          <Text style={styles.linkText}>Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL("https://instagram.com")}>
          <Text style={styles.linkText}>Instagram</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL("mailto:support@woodcraft.com")}>
          <Text style={styles.linkText}>Email Us</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
  },
  copyright: {
    color: "#000",
    fontSize: 14,
    marginBottom: 8,
    fontFamily: "Montserrat-Regular",
  },
  linkContainer: {
    flexDirection: "row",
    gap: 20,
  },
  linkText: {
    color: "#d6461f",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
});
