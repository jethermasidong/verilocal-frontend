import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  TextInput,
  Pressable,
  Animated,
} from "react-native";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

export default function Contact() {
  const { height, width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  const isMobile = width < 900;

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
    "Montserrat-Black": require("../assets/fonts/Montserrat/static/Montserrat-Black.ttf"),
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 900,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  const underlineWidth = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140],
  });

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.section, { minHeight: height }]}>
      {/* Background Layers */}
      <View style={styles.gradientBackground} />
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <Animated.View
        style={[
          styles.container,
          {
            flexDirection: isMobile ? "column" : "row",
            opacity: fadeAnim,
          },
        ]}
      >
        {/* LEFT SIDE */}
        <View style={styles.leftContent}>
          <Text style={styles.headingLight}>Let’s</Text>

          <View>
            <Text style={styles.headingBold}>CONNECT</Text>
            <Animated.View
              style={[styles.underline, { width: underlineWidth }]}
            />
          </View>

          <Text style={styles.subText}>
            Have questions about verification, partnerships,
            or protecting your craftsmanship?
          </Text>

          <Text style={styles.subTextAccent}>
            Honoring the craft. Protecting the creator.
          </Text>

          <View style={{ marginTop: 30 }}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={22} color="#4A70A9" />
              <Text style={styles.infoText}>verilocalphi@gmail.com</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={22} color="#4A70A9" />
              <Text style={styles.infoText}>+63 956 095 5026</Text>
            </View>
          </View>
        </View>

        {/* RIGHT SIDE FORM */}
        <View style={[styles.contactCard, { marginTop: isMobile ? 40 : 0 }]}>
          <Text style={styles.cardTitle}>Send Us a Message</Text>

          <TextInput
            placeholder="Your Name"
            placeholderTextColor="#777"
            style={styles.input}
          />

          <TextInput
            placeholder="Your Email"
            placeholderTextColor="#777"
            style={styles.input}
          />

          <TextInput
            placeholder="Your Message"
            placeholderTextColor="#777"
            multiline
            style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          />

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Send Message</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    overflow: "hidden",
    backgroundColor: "#eef3fb",
  },

  gradientBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#eef3fb",
  },

  circleTop: {
    position: "absolute",
    width: 500,
    height: 500,
    backgroundColor: "#4A70A9",
    opacity: 0.08,
    borderRadius: 250,
    top: -150,
    left: -100,
  },

  circleBottom: {
    position: "absolute",
    width: 400,
    height: 400,
    backgroundColor: "#4A70A9",
    opacity: 0.06,
    borderRadius: 200,
    bottom: -120,
    right: -80,
  },

  container: {
    width: "100%",
    maxWidth: 1200,
    gap: 80,
  },

  leftContent: {
    flex: 1,
    alignItems: "flex-start",
  },

  headingLight: {
    fontSize: 44,
    fontFamily: "Montserrat-Regular",
    color: "#222",
  },

  headingBold: {
    fontSize: 72, // more dramatic
    fontFamily: "Montserrat-Black", // stronger weight
    color: "#4A70A9",
    letterSpacing: 5, // premium spacing
  },

  underline: {
    height: 6,
    backgroundColor: "#4A70A9",
    marginTop: 8,
    borderRadius: 6,
  },

  subText: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "Garet-Book",
    color: "#444",
    marginTop: 25,
    maxWidth: 500,
  },

  subTextAccent: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "Garet-Book",
    color: "#4A70A9",
    marginTop: 12,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  infoText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "Garet-Book",
    color: "#333",
  },

  contactCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 40,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 15 },
    elevation: 10,
    maxWidth: 500,
    width: "100%",
  },

  cardTitle: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#4A70A9",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    height: 55,
    borderRadius: 12,
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 16,
    marginBottom: 18,
    fontSize: 16,
    fontFamily: "Garet-Book",
  },

  button: {
    backgroundColor: "#4A70A9",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
});