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

const INDIGO = "#4338ca";
const INDIGO_SOFT = "#6366f1";
const SLATE_DARK = "#0a0f1e";
const SLATE_MID = "#1e293b";
const SLATE_TEXT = "#64748b";
const SLATE_LIGHT = "#f1f5f9";
const WHITE = "#ffffff";
const BORDER = "#e2e8f0";

export default function AboutMe() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 900;
  const isWeb = Platform.OS === "web";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const lineScaleAnim = useRef(new Animated.Value(0)).current;

  const cardAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const pillarAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.timing(lineScaleAnim, {
      toValue: 1,
      duration: 900,
      delay: 400,
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      120,
      cardAnims.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 700, delay: 300, useNativeDriver: true })
      )
    ).start();

    Animated.stagger(
      100,
      pillarAnims.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 500, delay: 600, useNativeDriver: true })
      )
    ).start();
  }, []);

  const cards = [
    {
      title: "Mission",
      text: "Empowering Filipino artisans through secure blockchain authentication and digital verification.",
      icon: "shield-checkmark-outline",
      accent: "#6366f1",
    },
    {
      title: "Vision",
      text: "Building a globally trusted ecosystem for authentic Filipino-made products.",
      icon: "globe-outline",
      accent: "#0ea5e9",
    },
    {
      title: "Values",
      text: "Integrity, transparency, innovation, and pride in local craftsmanship.",
      icon: "ribbon-outline",
      accent: "#10b981",
    },
  ];

  const pillars = [
    { icon: "lock-closed-outline", label: "Secure Authentication" },
    { icon: "sync-outline", label: "Supply Chain Transparency" },
    { icon: "shield-outline", label: "Consumer Trust Protection" },
  ];

  return (
    <View style={[styles.section, { minHeight: height }]}>
      <View style={styles.bgAccent} pointerEvents="none" />

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
        <View
          style={[
            styles.left,
            { marginRight: isMobile ? 0 : 90, marginBottom: isMobile ? 56 : 0 },
          ]}
        >
          <View style={styles.labelRow}>
            <Animated.View
              style={[
                styles.labelLine,
                { transform: [{ scaleX: lineScaleAnim }] },
              ]}
            />
            <Text style={styles.label}>ABOUT US</Text>
          </View>

          <Animated.Image
            source={Logo}
            resizeMode="contain"
            style={[
              styles.logo,
              { width: isMobile ? 200 : 260, alignSelf: isMobile ? "center" : "flex-start" },
            ]}
          />

          <Text style={[styles.heading, isMobile && { textAlign: "center" }]}>
            Preserving authenticity{"\n"}through technology.
          </Text>

          <View style={styles.divider} />

          <Text style={[styles.paragraph, isMobile && { textAlign: "center" }]}>
            VeriLokal bridges traditional Filipino craftsmanship with modern
            blockchain infrastructure — safeguarding product authenticity and
            enabling full supply chain transparency.
          </Text>

          <Text style={[styles.paragraph, isMobile && { textAlign: "center" }]}>
            We provide secure digital verification to protect artisans,
            strengthen consumer trust, and elevate Filipino products in the
            global marketplace.
          </Text>

          <View style={[styles.pillarsContainer, isMobile && { alignItems: "center" }]}>
            {pillars.map((p, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.pillarItem,
                  {
                    opacity: pillarAnims[i],
                    transform: [
                      {
                        translateX: pillarAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-16, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.pillarDot} />
                <Ionicons name={p.icon} size={15} color={INDIGO_SOFT} style={{ marginRight: 8 }} />
                <Text style={styles.pillarText}>{p.label}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={[styles.right, !isMobile && styles.grid]}>
          {cards.map((card, index) => {
            const anim = cardAnims[index];
            const hoverAnim = useRef(new Animated.Value(0)).current;

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
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [32, 0],
                        }),
                      },
                    ],
                  },
                  index === 2 && !isMobile && styles.cardFull,
                ]}
                {...(isWeb
                  ? {
                      onMouseEnter: () =>
                        Animated.spring(hoverAnim, {
                          toValue: 1,
                          friction: 6,
                          tension: 100,
                          useNativeDriver: true,
                        }).start(),
                      onMouseLeave: () =>
                        Animated.spring(hoverAnim, {
                          toValue: 0,
                          friction: 6,
                          tension: 100,
                          useNativeDriver: true,
                        }).start(),
                    }
                  : {})}
              >
                <Animated.View
                  style={[
                    styles.cardHighlight,
                    { backgroundColor: card.accent },
                    {
                      opacity: hoverAnim.interpolate
                        ? hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.07] })
                        : 0,
                    },
                  ]}
                />
                <View style={[styles.cardIconWrap, { backgroundColor: card.accent + "12" }]}>
                  <Ionicons name={card.icon} size={18} color={card.accent} />
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardText}>{card.text}</Text>
                <View style={[styles.cardAccentBar, { backgroundColor: card.accent }]} />
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
    paddingHorizontal: 28,
    paddingVertical: 80,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },

  bgAccent: {
    position: "absolute",
    top: -120,
    right: -180,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: "#6366f1",
    opacity: 0.04,
  },

  container: {
    maxWidth: 1200,
    width: "100%",
    alignItems: "flex-start",
  },

  left: {
    flex: 1,
    maxWidth: 560,
  },

  right: {
    flex: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },

  labelLine: {
    width: 28,
    height: 1.5,
    backgroundColor: INDIGO_SOFT,
    transformOrigin: "left",
  },

  label: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: INDIGO_SOFT,
    fontFamily: "Montserrat-Bold",
  },

  logo: {
    height: 80,
    marginBottom: 24,
  },

  heading: {
    fontSize: 30,
    fontFamily: "Montserrat-Bold",
    color: SLATE_DARK,
    lineHeight: 42,
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  divider: {
    width: 40,
    height: 2,
    backgroundColor: INDIGO,
    marginBottom: 20,
    borderRadius: 2,
  },

  paragraph: {
    fontSize: 15.5,
    lineHeight: 27,
    fontFamily: "Garet-Book",
    color: SLATE_TEXT,
    marginBottom: 14,
  },

  pillarsContainer: {
    marginTop: 28,
    gap: 14,
  },

  pillarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },

  pillarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: INDIGO_SOFT,
    marginRight: 10,
  },

  pillarText: {
    fontSize: 13.5,
    color: SLATE_MID,
    fontFamily: "Garet-Book",
    letterSpacing: 0.2,
  },

  card: {
    backgroundColor: WHITE,
    padding: 28,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#0a0f1e",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    overflow: "hidden",
    position: "relative",
  },

  cardFull: {
    width: "100%",
  },

  cardHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginBottom: 10,
    color: SLATE_DARK,
    letterSpacing: -0.2,
  },

  cardText: {
    fontSize: 14,
    fontFamily: "Garet-Book",
    color: SLATE_TEXT,
    lineHeight: 23,
  },

  cardAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 3,
    height: "100%",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    opacity: 0.7,
  },
});