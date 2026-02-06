import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import bgImage from "../assets/bg.jpg";
import LoginButtons from "../components/LoginButtons";
import AboutMe from "./aboutme";
import Contact from "./contact";

export default function Home() {
  const { width, height } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../assets/fonts/garet/Garet-Heavy.ttf"),
  });

  const isMobile = width < 768;

  const trueScale = useRef(new Animated.Value(0.8)).current;
  const trueOpacity = useRef(new Animated.Value(0)).current;

  const oursScale = useRef(new Animated.Value(0.8)).current;
  const oursOpacity = useRef(new Animated.Value(0)).current;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(trueScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(trueOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(oursScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(oursOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

    useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={bgImage} 
          style={styles.background}
          imageStyle={{ opacity: 0.3}}
          resizeMode="cover"
       >
        {/* HERO SECTION */}
        <Animated.View
            style={{
              minHeight: 850,
              justifyContent: "center",
              paddingHorizontal: isMobile ? 24 : 80,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
          {/* CONTENT WRAPPER */}
          <View
            style={{
              maxWidth: 700,
              alignSelf: isMobile ? "center" : "flex-start",
              marginLeft: isMobile ? 0 : 40,
            }}
          >
            {/* Headline */}
            <Text
              style={{
                marginTop: -50,
                fontFamily: "Montserrat-Bold",
                fontSize: isMobile ? 42 : 66,
                marginBottom: 4,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Honoring the
            </Text>

            {/* POP-UP: TRUE */}
            <Animated.Text
              style={{
                fontFamily: "Garet-Heavy",
                fontSize: isMobile ? 42 : 66,
                marginBottom: 12,
                textAlign: isMobile ? "center" : "left",
                color: "#5177b0",
                opacity: trueOpacity,
                transform: [{ scale: trueScale }],
              }}
            >
              CRAFT,
            </Animated.Text>

            <Text
              style={{
                fontFamily: "Montserrat-Bold",
                fontSize: isMobile ? 42 : 66,
                marginBottom: 4,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Protecting the
            </Text>

            {/* POP-UP: OURS */}
            <Animated.Text
              style={{
                fontFamily: "Garet-Heavy",
                fontSize: isMobile ? 42 : 66,
                marginBottom: 24,
                textAlign: isMobile ? "center" : "left",
                color: "#5177b0",
                opacity: oursOpacity,
                transform: [{ scale: oursScale }],
              }}
            >
              CREATOR.
            </Animated.Text>

            {/* Subtext */}
            <Text
              style={{
                fontFamily: "Garet-Book",
                fontSize: isMobile ? 16 : 18,
                lineHeight: 26,
                maxWidth: 520,
                marginBottom: 32,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Ensuring genuine Filipino craftsmanship through secure QR
              verification and blockchain technology.
            </Text>

            {/* CTA */}
            <LoginButtons />
          </View>
        </Animated.View>
        </ImageBackground>
       <AboutMe />
      <Contact />
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});