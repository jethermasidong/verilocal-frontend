import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import bgImage from "../assets/bg.jpg";
import craftGif from "../assets/crafts.gif";
import LoginButtons from "../components/LoginButtons";
import AboutMe from "./aboutme";
import Contact from "./contact";

const C = {
  ink:     "#111418",
  mid:     "#6b7280",
  soft:    "#9ca3af",
  rule:    "#e5e7eb",
  accent:  "#3b5bdb",
  accentL: "rgba(59,91,219,0.08)",
  accentM: "rgba(59,91,219,0.13)",
  white:   "#ffffff",
  frost:   "#f0f4ff",
};

export default function Home() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 900;

  const [fontsLoaded] = useFonts({
    "Garet-Book":      require("../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy":     require("../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
  });

  const masterFade  = useRef(new Animated.Value(0)).current;
  const masterSlide = useRef(new Animated.Value(20)).current;
  const word1Fade   = useRef(new Animated.Value(0)).current;
  const word1Slide  = useRef(new Animated.Value(14)).current;
  const word2Fade   = useRef(new Animated.Value(0)).current;
  const word2Slide  = useRef(new Animated.Value(14)).current;
  const subFade     = useRef(new Animated.Value(0)).current;
  const btnFade     = useRef(new Animated.Value(0)).current;
  const statFade    = useRef(new Animated.Value(0)).current;
  const imgFade     = useRef(new Animated.Value(0)).current;
  const imgSlide    = useRef(new Animated.Value(32)).current;

  const ease = (ref, toVal, dur, delay = 0) =>
    Animated.timing(ref, { toValue: toVal, duration: dur, delay, useNativeDriver: true });

  useEffect(() => {
    Animated.parallel([
      ease(masterFade,  1, 500),
      ease(masterSlide, 0, 500),
    ]).start();

    Animated.sequence([
      Animated.delay(180),
      Animated.parallel([ease(word1Fade, 1, 420), ease(word1Slide, 0, 420)]),
      Animated.delay(90),
      Animated.parallel([ease(word2Fade, 1, 420), ease(word2Slide, 0, 420)]),
      Animated.delay(80),
      ease(subFade,  1, 380),
      Animated.delay(60),
      ease(btnFade,  1, 360),
      Animated.delay(40),
      ease(statFade, 1, 340),
    ]).start();

    Animated.parallel([
      ease(imgFade,  1, 800, 350),
      ease(imgSlide, 0, 800, 350),
    ]).start();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <ImageBackground
          source={bgImage}
          style={styles.bg}
          imageStyle={{ opacity: 0.04 }}
          resizeMode="cover"
        >
          <View style={styles.topRule} />

          <Animated.View
            style={[
              styles.hero,
              {
                minHeight: height,
                flexDirection: isMobile ? "column" : "row",
                paddingHorizontal: isMobile ? 28 : 80,
                opacity: masterFade,
                transform: [{ translateY: masterSlide }],
                alignItems: "center",
                justifyContent: isMobile ? "center" : "space-between",
              },
            ]}
          >

            <View
              style={[
                styles.left,
                {
                  alignItems: isMobile ? "center" : "flex-start",
                  maxWidth: isMobile ? "100%" : 540,
                  flex: isMobile ? undefined : 1,
                  marginLeft: isMobile ? 20 : 100,
                  marginBottom: isMobile ? 0 : 100,
                },
              ]}
            >
              <View style={[styles.eyebrow, isMobile && { alignSelf: "center" }]}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrowText}>Filipino Blockchain Verification</Text>
              </View>

              <View style={{ gap: 0 }}>
                <Text
                  style={[
                    styles.h1Light,
                    { fontSize: isMobile ? 34 : 54, textAlign: isMobile ? "center" : "left" },
                  ]}
                >
                  Honoring the
                </Text>

                <Animated.Text
                  style={[
                    styles.h1Bold,
                    {
                      fontSize: isMobile ? 36 : 58,
                      textAlign: isMobile ? "center" : "left",
                      opacity: word1Fade,
                      transform: [{ translateY: word1Slide }],
                    },
                  ]}
                >
                  CRAFT,
                </Animated.Text>

                <Text
                  style={[
                    styles.h1Light,
                    { fontSize: isMobile ? 34 : 54, textAlign: isMobile ? "center" : "left", marginTop: 4 },
                  ]}
                >
                  Protecting the
                </Text>

                <Animated.Text
                  style={[
                    styles.h1Bold,
                    {
                      fontSize: isMobile ? 36 : 58,
                      textAlign: isMobile ? "center" : "left",
                      marginBottom: 28,
                      opacity: word2Fade,
                      transform: [{ translateY: word2Slide }],
                    },
                  ]}
                >
                  CREATOR.
                </Animated.Text>
              </View>

              {/* subtext */}
              <Animated.Text
                style={[
                  styles.sub,
                  {
                    fontSize: isMobile ? 15 : 16,
                    textAlign: isMobile ? "center" : "left",
                    opacity: subFade,
                  },
                ]}
              >
                Ensuring genuine Filipino craftsmanship through secure QR
                verification and blockchain technology.
              </Animated.Text>

              {/* CTA */}
              <Animated.View
                style={[
                  { alignSelf: isMobile ? "center" : "flex-start", marginBottom: 40 },
                  { opacity: btnFade },
                ]}
              >
                <LoginButtons />
              </Animated.View>

              {/* stats */}
              <Animated.View
                style={[
                  styles.stats,
                  { justifyContent: isMobile ? "center" : "flex-start", opacity: statFade },
                ]}
              >
                {[
                  { value: "100%", label: "Trusted" },
                  { value: "Secure", label: "Blockchain" },
                  { value: "PH", label: "Made" },
                ].map((s, i) => (
                  <View key={i} style={styles.statItem}>
                    {i !== 0 && <View style={styles.statDivider} />}
                    <View style={styles.statContent}>
                      <Text style={styles.statVal}>{s.value}</Text>
                      <Text style={styles.statLbl}>{s.label}</Text>
                    </View>
                  </View>
                ))}
              </Animated.View>
            </View>

            {!isMobile && (
              <Animated.View
                style={[
                  styles.showcase,
                  { opacity: imgFade, transform: [{ translateY: imgSlide }] },
                ]}
              >

                {/* 1. wide ambient glow blob */}
                <View style={styles.glowBlob} />

                {/* 2. outer dashed orbit */}
                <View style={styles.orbitDash} />

                {/* 3. inner crisp ring */}
                <View style={styles.ringCrisp} />

                {/* 4. tilted frost card (behind main) */}
                <View style={styles.tiltCard} />

                {/* 5. second slight-tilt card */}
                <View style={styles.tiltCard2} />

                {/* 6. main image card */}
                <View style={styles.mainCard}>
                  {/* soft corner washes */}
                  <View style={[styles.wash, { top: 0, left: 0, borderTopLeftRadius: 26 }]} />
                  <View style={[styles.wash, { bottom: 0, right: 0, borderBottomRightRadius: 26 }]} />

                  <Image source={craftGif} style={styles.gif} resizeMode="contain" />
                </View>

                <View style={[styles.pill, { top: 84, right: 56 }]}>
                  <View style={styles.greenDot} />
                  <Text style={styles.pillText}>Verified</Text>
                </View>

                <View style={[styles.pill, { bottom: 60, left: 60 }]}>
                  <Text style={{ fontSize: 13 }}>🇵🇭</Text>
                  <Text style={styles.pillText}>Filipino Made</Text>
                </View>

                <View style={[styles.pill, styles.pillSmall, { top: 72, left: 60 }]}>
                  <View style={styles.blueDot} />
                  <Text style={styles.pillTextSmall}>Blockchain</Text>
                </View>

              </Animated.View>
            )}

          </Animated.View>
        </ImageBackground>

        <AboutMe />
        <Contact />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%" },

  topRule: {
    height: 2,
    width: 40,
    backgroundColor: "#3b5bdb",
    marginLeft: 90,
    marginTop: 5,
    borderRadius: 2,
  },

  hero: {
    paddingTop: 24,
    paddingBottom: 84,
  },

  left: { zIndex: 2 },

  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 22,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: "rgba(59,91,219,0.07)",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(59,91,219,0.15)",
    alignSelf: "flex-start",
  },

  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#3b5bdb",
    shadowColor: "#3b5bdb",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 5,
  },

  eyebrowText: {
    fontSize: 11,
    fontFamily: "Garet-Book",
    color: "#3b5bdb",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },

  h1Light: {
    fontFamily: "Garet-Book",
    color: "#9ca3af",
    lineHeight: 64,
    letterSpacing: -0.4,
  },

  h1Bold: {
    fontFamily: "Garet-Heavy",
    color: "#111418",
    lineHeight: 68,
    letterSpacing: -1.6,
  },

  sub: {
    fontFamily: "Garet-Book",
    lineHeight: 27,
    color: "#9ca3af",
    maxWidth: 420,
    marginBottom: 34,
    letterSpacing: 0.1,
  },

  stats: {
    flexDirection: "row",
    alignItems: "center",
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 22,
  },

  statContent: { alignItems: "flex-start" },

  statVal: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#111418",
    letterSpacing: -0.4,
  },

  statLbl: {
    fontSize: 10,
    fontFamily: "Garet-Book",
    color: "#9ca3af",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 2,
  },


  showcase: {
    width: 760,
    height: 760,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 36,
    marginRight: 56,
    marginTop: -70,
    position: "relative",
  },


  glowBlob: {
    position: "absolute",
    width: 670,
    height: 670,
    borderRadius: 250,
    backgroundColor: "#3b5bdb",
    opacity: 0.07,
    shadowColor: "#3b5bdb",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 70,
  },

  orbitDash: {
    position: "absolute",
    width: 590,
    height: 590,
    borderRadius: 195,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(59,91,219,0.12)",
    backgroundColor: "transparent",
  },

  ringCrisp: {
    position: "absolute",
    width: 550,
    height: 550,
    borderRadius: 175,
    borderWidth: 1,
    borderColor: "rgba(59,91,219,0.09)",
    backgroundColor: "transparent",
  },

  tiltCard: {
    position: "absolute",
    width: 450,
    height: 450,
    borderRadius: 30,
    backgroundColor: "#eef2ff",
    transform: [{ rotate: "-8deg" }],
    opacity: 0.8,
  },

  tiltCard2: {
    position: "absolute",
    width: 450,
    height: 450,
    borderRadius: 28,
    backgroundColor: "#f5f7ff",
    transform: [{ rotate: "4deg" }],
    opacity: 0.6,
    borderWidth: 1,
    borderColor: "rgba(59,91,219,0.08)",
  },

  mainCard: {
    width: 450,
    height: 450,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#3b5bdb",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.13,
    shadowRadius: 50,
    elevation: 14,
    position: "relative",
  },

  wash: {
    position: "absolute",
    width: 80,
    height: 80,
    backgroundColor: "rgba(59,91,219,0.05)",
    zIndex: 1,
  },

  gif: {
    width: 400,
    height: 400,
    zIndex: 2,
  },

  pill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#111418",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 6,
    zIndex: 10,
  },

  pillSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
  },

  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b5bdb",
    shadowColor: "#3b5bdb",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },

  pillText: {
    fontSize: 12,
    fontFamily: "Garet-Book",
    color: "#111418",
    letterSpacing: 0.2,
  },

  pillTextSmall: {
    fontSize: 11,
    fontFamily: "Garet-Book",
    color: "#111418",
    letterSpacing: 0.2,
  },
});