import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import Logo from "../assets/images/verilokal_text.png";

export default function AboutMe() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  // Main animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // Card animations (staggered)
  const card1 = useRef(new Animated.Value(0)).current;
  const card2 = useRef(new Animated.Value(0)).current;
  const card3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade + slide main content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger cards
    Animated.stagger(250, [
      Animated.timing(card1, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(card2, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(card3, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.section, { minHeight: height }]}>
      <Animated.View
        style={[
          styles.container,
          {
            flexDirection: isMobile ? "column" : "row",
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* LEFT SIDE */}
        <View style={[styles.left, { marginRight: isMobile ? 0 : 60 }]}>
          <Text style={styles.subtitle}>Who We Are</Text>

          {/* LOGO */}
          <Animated.Image
            source={Logo}
            resizeMode="contain"
            style={[
              styles.logo,
              {
                width: isMobile ? 220 : 280,
              },
            ]}
          />

          <Text style={styles.description}>
            We are dedicated to preserving the authenticity of Filipino-made
            products by combining traditional artistry with modern blockchain
            technology.
          </Text>

          <Text style={styles.description}>
            Our platform ensures transparency, trust, and protection for both
            artisans and consumers in the global market.
          </Text>
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.right}>
          {[card1, card2, card3].map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.card,
                {
                  opacity: anim,
                  transform: [
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {index === 0 && (
                <>
                  <Text style={styles.cardTitle}>Our Mission</Text>
                  <Text style={styles.cardText}>
                    Empower Filipino artisans through secure blockchain
                    verification.
                  </Text>
                </>
              )}

              {index === 1 && (
                <>
                  <Text style={styles.cardTitle}>Our Vision</Text>
                  <Text style={styles.cardText}>
                    A future where every Filipino product is trusted and
                    globally recognized.
                  </Text>
                </>
              )}

              {index === 2 && (
                <>
                  <Text style={styles.cardTitle}>Our Values</Text>
                  <Text style={styles.cardText}>
                    Integrity, Innovation, Transparency, and Pride in local
                    craftsmanship.
                  </Text>
                </>
              )}
            </Animated.View>
          ))}
        </View>
      </Animated.View>
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

  container: {
    maxWidth: 1100,
    width: "100%",
    alignItems: "center",
  },

  left: {
    flex: 1,
    maxWidth: 550,
  },

  right: {
    flex: 1,
    maxWidth: 450,
    marginTop: 30,
  },

  subtitle: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#6c63ff",
    marginBottom: 12,
    fontFamily: "Montserrat-Bold",
  },

  logo: {
    height: 80,
    marginBottom: 20,
  },

  description: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "Garet-Book",
    color: "#444",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginBottom: 8,
    color: "#111",
  },

  cardText: {
    fontSize: 15,
    fontFamily: "Garet-Book",
    color: "#555",
    lineHeight: 22,
  },
});