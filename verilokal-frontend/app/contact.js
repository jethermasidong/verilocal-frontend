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
      {/* Background */}
      <View style={styles.backgroundBase} />

      <View
        style={[
          styles.circleTop,
          {
            width: isMobile ? 300 : 500,
            height: isMobile ? 300 : 500,
          },
        ]}
      />

      <View
        style={[
          styles.circleBottom,
          {
            width: isMobile ? 250 : 400,
            height: isMobile ? 250 : 400,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.container,
          {
            flexDirection: isMobile ? "column" : "row",
            opacity: fadeAnim,
            alignItems: isMobile ? "center" : "flex-start",
          },
        ]}
      >
        {/* LEFT SIDE */}
        <View
          style={[
            styles.leftContent,
            { alignItems: isMobile ? "center" : "flex-start" },
          ]}
        >
          <Text
            style={[
              styles.headingLight,
              {
                fontSize: isMobile ? 32 : 44,
                textAlign: isMobile ? "center" : "left",
              },
            ]}
          >
            Let’s
          </Text>

          <View>
            <Text
              style={[
                styles.headingBold,
                {
                  fontSize: isMobile ? 46 : 72,
                  letterSpacing: isMobile ? 2 : 5,
                  textAlign: isMobile ? "center" : "left",
                },
              ]}
            >
              CONNECT
            </Text>

            <Animated.View
              style={[
                styles.underline,
                {
                  width: underlineWidth,
                  alignSelf: isMobile ? "center" : "flex-start",
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.subText,
              { textAlign: isMobile ? "center" : "left" },
            ]}
          >
            Have questions about verification, partnerships,
            or protecting your craftsmanship?
          </Text>

          <Text
            style={[
              styles.subTextAccent,
              { textAlign: isMobile ? "center" : "left" },
            ]}
          >
            Honoring the craft. Protecting the creator.
          </Text>

          <View style={{ marginTop: 30 }}>
            <View
              style={[
                styles.infoRow,
                { justifyContent: isMobile ? "center" : "flex-start" },
              ]}
            >
              <Ionicons name="mail-outline" size={22} color="#4A70A9" />
              <Text style={styles.infoText}>
                verilocalphi@gmail.com
              </Text>
            </View>

            <View
              style={[
                styles.infoRow,
                { justifyContent: isMobile ? "center" : "flex-start" },
              ]}
            >
              <Ionicons name="call-outline" size={22} color="#4A70A9" />
              <Text style={styles.infoText}>
                +63 956 095 5026
              </Text>
            </View>
          </View>
        </View>

        {/* RIGHT SIDE FORM */}
        <View
          style={[
            styles.contactCard,
            {
              padding: isMobile ? 25 : 40,
              marginTop: isMobile ? 40 : 0,
            },
          ]}
        >
          <Text style={styles.cardTitle}>
            Send Us a Message
          </Text>

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
            style={[
              styles.input,
              { height: 120, textAlignVertical: "top" },
            ]}
          />

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>
              Send Message
            </Text>
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
    paddingHorizontal: 20,
    overflow: "hidden",
    backgroundColor: "#eef3fb",
  },

  backgroundBase: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#eef3fb",
  },

  circleTop: {
    position: "absolute",
    backgroundColor: "#4A70A9",
    opacity: 0.08,
    borderRadius: 500,
    top: -100,
    left: -80,
  },

  circleBottom: {
    position: "absolute",
    backgroundColor: "#4A70A9",
    opacity: 0.06,
    borderRadius: 500,
    bottom: -80,
    right: -60,
  },

  container: {
    width: "100%",
    maxWidth: 1200,
    gap: 60,
  },

  leftContent: {
    flex: 1,
  },

  headingLight: {
    fontFamily: "Montserrat-Regular",
    color: "#222",
  },

  headingBold: {
    fontFamily: "Montserrat-Black",
    color: "#4A70A9",
  },

  underline: {
    height: 6,
    backgroundColor: "#4A70A9",
    marginTop: 8,
    borderRadius: 6,
  },

  subText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: "Garet-Book",
    color: "#444",
    marginTop: 20,
    maxWidth: 500,
  },

  subTextAccent: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: "Garet-Book",
    color: "#4A70A9",
    marginTop: 10,
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
    paddingVertical: 18,
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