import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.copyright}>
       © 2026 VERILOCAL. All rights reserved. | Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#ffffff",
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
    color: "#000000",
    fontStyle: "italic",
    marginTop: 5,
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "Montserrat-Regular",
  },
});
