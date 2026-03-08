import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";

const BLUE = "#3b6fd4";
const BLUE_DARK = "#2c55a8";
const BLUE_TINT = "#eef3fb";
const SLATE = "#1a2340";
const TEXT_MID = "#475569";
const TEXT_LIGHT = "#94a3b8";
const WHITE = "#ffffff";
const INPUT_BG = "#f4f7fc";
const BORDER = "#dde5f4";

export default function Contact() {
  const { height, width } = useWindowDimensions();
  const isMobile = width < 900;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(36)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  const fieldAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const infoAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
    "Montserrat-Black": require("../assets/fonts/Montserrat/static/Montserrat-Black.ttf"),
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 800,
      delay: 350,
      useNativeDriver: false,
    }).start();

    Animated.stagger(
      90,
      infoAnims.map((a) =>
        Animated.timing(a, { toValue: 1, duration: 500, delay: 500, useNativeDriver: true })
      )
    ).start();

    Animated.stagger(
      100,
      fieldAnims.map((a) =>
        Animated.timing(a, { toValue: 1, duration: 550, delay: 400, useNativeDriver: true })
      )
    ).start();
  }, []);

  const underlineWidth = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isMobile ? 110 : 150],
  });

  if (!fontsLoaded) return null;

  const contactInfo = [
    { icon: "mail-outline", value: "verilocalphi@gmail.com" },
    { icon: "call-outline", value: "+63 956 095 5026" },
  ];

  const fields = [
    { placeholder: "Your Name", multiline: false },
    { placeholder: "Your Email", multiline: false },
    { placeholder: "Your Message", multiline: true },
  ];

  return (
    <View style={[styles.section, { minHeight: height }]}>
      <View style={styles.blobTopRight} pointerEvents="none" />
      <View style={styles.blobBottomLeft} pointerEvents="none" />
      <View style={styles.gridLines} pointerEvents="none" />

      <Animated.View
        style={[
          styles.container,
          {
            flexDirection: isMobile ? "column" : "row",
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: isMobile ? "stretch" : "flex-start",
          },
        ]}
      >
        <View
          style={[
            styles.leftContent,
            {
              alignItems: isMobile ? "center" : "flex-start",
              marginBottom: isMobile ? 40 : 0,
              marginRight: isMobile ? 0 : 80,
            },
          ]}
        >
          <View style={styles.labelRow}>
            <View style={styles.labelDash} />
            <Text style={styles.labelTag}>CONTACT US</Text>
          </View>

          <Text
            style={[
              styles.headingLight,
              {
                fontSize: isMobile ? 28 : 40,
                textAlign: isMobile ? "center" : "left",
              },
            ]}
          >
            Let's
          </Text>

          <View style={{ alignSelf: isMobile ? "center" : "flex-start" }}>
            <Text
              style={[
                styles.headingBold,
                {
                  fontSize: isMobile ? 48 : 68,
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

          <View style={styles.divider} />

          <Text
            style={[
              styles.subText,
              { textAlign: isMobile ? "center" : "left" },
            ]}
          >
            Have questions about verification, partnerships, or protecting your
            craftsmanship? We're here.
          </Text>

          <Text
            style={[
              styles.tagline,
              { textAlign: isMobile ? "center" : "left" },
            ]}
          >
            Honoring the craft. Protecting the creator.
          </Text>

          <View style={[styles.infoList, isMobile && { alignItems: "center" }]}>
            {contactInfo.map((item, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.infoRow,
                  {
                    justifyContent: isMobile ? "center" : "flex-start",
                    opacity: infoAnims[i],
                    transform: [
                      {
                        translateX: infoAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-14, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.infoIconWrap}>
                  <Ionicons name={item.icon} size={16} color={BLUE} />
                </View>
                <Text style={styles.infoText}>{item.value}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.contactCard,
            {
              padding: isMobile ? 24 : 40,
              marginHorizontal: isMobile ? 0 : 0,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Send Us a Message</Text>
            <Text style={styles.cardSubtitle}>We typically reply within 24 hours.</Text>
          </View>

          {fields.map((field, i) => (
            <Animated.View
              key={i}
              style={{
                opacity: fieldAnims[i],
                transform: [
                  {
                    translateY: fieldAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              }}
            >
              <TextInput
                placeholder={field.placeholder}
                placeholderTextColor={TEXT_LIGHT}
                multiline={field.multiline}
                style={[
                  styles.input,
                  field.multiline && { height: 110, textAlignVertical: "top", paddingTop: 14 },
                ]}
              />
            </Animated.View>
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
            ]}
          >
            <Text style={styles.buttonText}>Send Message</Text>
            <Ionicons name="arrow-forward-outline" size={17} color={WHITE} style={{ marginLeft: 8 }} />
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
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: BLUE_TINT,
    overflow: "hidden",
  },

  blobTopRight: {
    position: "absolute",
    width: 460,
    height: 460,
    borderRadius: 230,
    backgroundColor: BLUE,
    opacity: 0.06,
    top: -140,
    right: -120,
  },

  blobBottomLeft: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: BLUE,
    opacity: 0.05,
    bottom: -100,
    left: -80,
  },

  gridLines: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.025,
    backgroundColor: "transparent",
  },

  container: {
    width: "100%",
    maxWidth: 1200,
  },

  leftContent: {
    flex: 1,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },

  labelDash: {
    width: 24,
    height: 1.5,
    backgroundColor: BLUE,
    borderRadius: 2,
  },

  labelTag: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: BLUE,
    fontFamily: "Montserrat-Bold",
  },

  headingLight: {
    fontFamily: "Montserrat-Regular",
    color: SLATE,
    lineHeight: 48,
  },

  headingBold: {
    fontFamily: "Montserrat-Black",
    color: BLUE,
    lineHeight: 80,
    letterSpacing: 3,
  },

  underline: {
    height: 4,
    backgroundColor: BLUE,
    marginTop: 4,
    borderRadius: 4,
    opacity: 0.6,
  },

  divider: {
    width: 36,
    height: 2,
    backgroundColor: BLUE,
    borderRadius: 2,
    marginTop: 20,
    marginBottom: 18,
    opacity: 0.4,
  },

  subText: {
    fontSize: 15.5,
    lineHeight: 27,
    fontFamily: "Garet-Book",
    color: TEXT_MID,
    maxWidth: 420,
  },

  tagline: {
    fontSize: 14,
    fontFamily: "Garet-Book",
    color: BLUE,
    marginTop: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    opacity: 0.85,
  },

  infoList: {
    marginTop: 32,
    gap: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#dce8f8",
    justifyContent: "center",
    alignItems: "center",
  },

  infoText: {
    fontSize: 14.5,
    fontFamily: "Garet-Book",
    color: SLATE,
    letterSpacing: 0.1,
  },

  contactCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 22,
    shadowColor: "#1a2340",
    shadowOpacity: 0.09,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },

  cardHeader: {
    marginBottom: 28,
  },

  cardTitle: {
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
    color: SLATE,
    marginBottom: 6,
  },

  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Garet-Book",
    color: TEXT_LIGHT,
    letterSpacing: 0.2,
  },

  input: {
    height: 52,
    borderRadius: 11,
    backgroundColor: INPUT_BG,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 15,
    fontFamily: "Garet-Book",
    color: SLATE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  button: {
    backgroundColor: BLUE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 6,
    shadowColor: BLUE,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  buttonText: {
    color: WHITE,
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
    letterSpacing: 0.4,
  },
});