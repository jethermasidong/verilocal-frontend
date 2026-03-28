import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function OptionRegistration() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Register Product</Text>
        <Text style={styles.subtitle}>
          Choose how you'd like to add your product.
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.cardsRow}>
        {/* Single Registration */}
        <Pressable
          onHoverIn={() => setHoveredCard("single")}
          onHoverOut={() => setHoveredCard(null)}
          onPress={() => router.push("/business/productRegistration")}
          style={[
            styles.optionCard,
            hoveredCard === "single" && styles.optionCardHovered,
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: "#eef2ff" }]}>
            <Ionicons name="cube-outline" size={44} color="#4A70A9" />
          </View>
          <Text style={styles.cardTitle}>Single Registration</Text>
          <Text style={styles.cardDesc}>
            Register one product at a time. Fill in the details manually with
            full control over each field.
          </Text>
          <View style={styles.cardBtn}>
            <Text style={styles.cardBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#fff" />
          </View>
        </Pressable>

        {/* Batch Registration */}
        <Pressable
          onHoverIn={() => setHoveredCard("batch")}
          onHoverOut={() => setHoveredCard(null)}
          onPress={() => router.push("/business/batchRegistration")}
          style={[
            styles.optionCard,
            hoveredCard === "batch" && styles.optionCardHovered,
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: "#f0fdf4" }]}>
            <Ionicons name="albums-outline" size={44} color="#457B5D" />
          </View>
          <Text style={styles.cardTitle}>Batch Registration</Text>
          <Text style={styles.cardDesc}>
            Upload multiple quantities of a product at once. Save time for large
            inventories.
          </Text>
          <View style={[styles.cardBtn, { backgroundColor: "#457B5D" }]}>
            <Text style={styles.cardBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#fff" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf2f5",
    paddingHorizontal: 32,
    paddingTop: 201,
    alignItems: "center",
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 32,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(200,210,230,0.6)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  backText: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    fontWeight: "600",
    color: "#1a2f5a",
  },

  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  title: {
    fontSize: 32,
    fontFamily: "Garet-Heavy",
    fontWeight: "700",
    color: "#1a2f5a",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    color: "#7a8a9a",
    textAlign: "center",
  },

  cardsRow: {
    flexDirection: "row",
    gap: 24,
    width: "100%",
    maxWidth: 800,
    justifyContent: "center",
  },

  optionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(200,210,230,0.5)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    gap: 16,
    cursor: "pointer",
    transitionDuration: "200ms",
  },

  optionCardHovered: {
    borderColor: "#4A70A9",
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },

  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontFamily: "Garet-Heavy",
    fontWeight: "700",
    color: "#1a2f5a",
    textAlign: "center",
  },

  cardDesc: {
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    color: "#7a8a9a",
    textAlign: "center",
    lineHeight: 20,
  },

  cardBtn: {
    marginTop: 8,
    backgroundColor: "#4A70A9",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignSelf: "stretch",
    justifyContent: "center",
  },

  cardBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
});
