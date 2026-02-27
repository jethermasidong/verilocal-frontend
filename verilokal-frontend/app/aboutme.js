import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Logo from "../assets/images/verilokal_text.png";

export default function AboutMe() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 900;
  const isWeb = Platform.OS === "web";

  // Section animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Cards animation
  const cardAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.stagger(
      150,
      cardAnims.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true })
      )
    ).start();
  }, []);

  const cards = [
    {
      title: "Mission",
      text: "Empowering Filipino artisans through secure blockchain authentication and digital verification.",
      icon: "shield-checkmark-outline",
    },
    {
      title: "Vision",
      text: "Building a globally trusted ecosystem for authentic Filipino-made products.",
      icon: "globe-outline",
    },
    {
      title: "Core Values",
      text: "Integrity, transparency, innovation, and pride in local craftsmanship.",
      icon: "ribbon-outline",
    },
  ];

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
        <View
          style={[
            styles.left,
            { marginRight: isMobile ? 0 : 80, marginBottom: isMobile ? 40 : 0 },
          ]}
        >
          <Text style={styles.label}>ABOUT US</Text>

          <Animated.Image
            source={Logo}
            resizeMode="contain"
            style={[
              styles.logo,
              { width: isMobile ? 220 : 300, alignSelf: isMobile ? "center" : "flex-start" },
            ]}
          />

          <Text style={[styles.heading, isMobile && { textAlign: "center" }]}>
            Preserving authenticity through technology.
          </Text>

          <Text style={[styles.paragraph, isMobile && { textAlign: "center" }]}>
            VeriLokal bridges traditional Filipino craftsmanship with modern
            blockchain infrastructure. Our platform safeguards product
            authenticity while enabling transparency across the supply chain.
          </Text>

          <Text style={[styles.paragraph, isMobile && { textAlign: "center" }]}>
            We provide secure digital verification to protect artisans,
            strengthen consumer trust, and elevate Filipino products in the
            global marketplace.
          </Text>

          {/* Key Pillars */}
          <View style={[styles.pillarsContainer, isMobile && { alignItems: "center" }]}>
            <View style={styles.pillarItem}>
              <Ionicons name="lock-closed-outline" size={18} color="#4f46e5" />
              <Text style={styles.pillarText}>Secure Authentication</Text>
            </View>

            <View style={styles.pillarItem}>
              <Ionicons name="sync-outline" size={18} color="#4f46e5" />
              <Text style={styles.pillarText}>Supply Chain Transparency</Text>
            </View>

            <View style={styles.pillarItem}>
              <Ionicons name="shield-outline" size={18} color="#4f46e5" />
              <Text style={styles.pillarText}>Consumer Trust Protection</Text>
            </View>
          </View>
        </View>

        {/* RIGHT SIDE */}
        <View style={[styles.right, !isMobile && styles.grid]}>
          {cards.map((card, index) => {
            const anim = cardAnims[index];
            const hoverAnim = useRef(new Animated.Value(1)).current;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.card,
                  {
                    width: isMobile ? "100%" : "48%",
                    opacity: anim,
                    transform: [
                      {
                        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }),
                      },
                      { scale: hoverAnim },
                    ],
                    shadowOpacity: hoverAnim.interpolate
                      ? hoverAnim.interpolate({ inputRange: [1, 1.03], outputRange: [0.04, 0.12] })
                      : 0.04,
                    elevation: hoverAnim.interpolate
                      ? hoverAnim.interpolate({ inputRange: [1, 1.03], outputRange: [3, 8] })
                      : 3,
                  },
                ]}
                {...(isWeb
                  ? {
                      onMouseEnter: () =>
                        Animated.spring(hoverAnim, {
                          toValue: 1.03,
                          friction: 5,
                          useNativeDriver: true,
                        }).start(),
                      onMouseLeave: () =>
                        Animated.spring(hoverAnim, {
                          toValue: 1,
                          friction: 5,
                          useNativeDriver: true,
                        }).start(),
                    }
                  : {})}
              >
                <Ionicons
                  name={card.icon}
                  size={22}
                  color="#4f46e5"
                  style={{ marginBottom: 14 }}
                />
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardText}>{card.text}</Text>
              </Animated.View>
            );
          })}
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
    paddingVertical: 60,
    backgroundColor: "#f8fafc",
  },

  container: {
    maxWidth: 1200,
    width: "100%",
    alignItems: "flex-start",
  },

  left: {
    flex: 1,
    maxWidth: 600,
  },

  right: {
    flex: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#6366f1",
    marginBottom: 16,
    fontFamily: "Montserrat-Bold",
  },

  logo: {
    height: 90,
    marginBottom: 20,
  },

  heading: {
    fontSize: 26,
    fontFamily: "Montserrat-Bold",
    color: "#0f172a",
    marginBottom: 18,
  },

  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: "Garet-Book",
    color: "#475569",
    marginBottom: 16,
  },

  pillarsContainer: {
    marginTop: 24,
    gap: 12,
  },

  pillarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  pillarText: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "Garet-Book",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 26,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  cardTitle: {
    fontSize: 17,
    fontFamily: "Montserrat-Bold",
    marginBottom: 10,
    color: "#0f172a",
  },

  cardText: {
    fontSize: 15,
    fontFamily: "Garet-Book",
    color: "#475569",
    lineHeight: 24,
  },
});