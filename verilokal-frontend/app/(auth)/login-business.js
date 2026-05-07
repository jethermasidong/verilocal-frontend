import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import qs from "qs";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import bgImage from "../../assets/bg1.jpg";

export default function BusinessLogin() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredScan, setHoveredScan] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const handleResize = () =>
      setIsMobile(Dimensions.get("window").width < 600);
    handleResize();
    Dimensions.addEventListener("change", handleResize);
    return () => Dimensions.removeEventListener("change", handleResize);
  }, []);

  const validateField = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!value) error = "Email is required";
      else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
      }
    }

    if (name === "password") {
      if (!value) error = "Password is required!";
      else if (value.length < 6) error = "Minimum 6 characters";
    }

    return error;
  };

  const handleBusinessLogin = async () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    if (!password) newErrors.password = "Password is required!";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://verilocalph.onrender.com/api/login",
        qs.stringify({ email, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      Alert.alert("OTP Sent", "Check your email for OTP");
      router.push({
        pathname: "/otp",
        params: { email },
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setErrors({ email: " ", password: "Incorrect Username or Password" });
      } else if (error.response?.status === 403) {
        setErrors({ email: " ", password: "Business not verified yet!" });
      } else {
        setErrors({ email: "Invalid Login", password: "Invalid Login" });
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <ImageBackground
        source={bgImage}
        style={styles.imageBackground}
        imageStyle={{ opacity: 0.08 }}
        resizeMode="cover"
      >
        <View style={styles.overlayGradient} />

        <ScrollView
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: isMobile ? 40 : 0,
            minHeight: "100%",
          }}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={isMobile}
        >

          <View
            style={[
              styles.loginCard,
              {
                flexDirection: isMobile ? "column" : "row",
                width: isMobile ? "88%" : "100%",
                maxWidth: isMobile ? 420 : 820,
              },
            ]}
          >
            {/* ── LEFT PANEL ── */}
            {!isMobile && (
              <View style={styles.leftPanel}>
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />

                <View style={styles.leftContent}>
                  <Text style={styles.leftTagline}>Welcome back,</Text>
                  <Text style={styles.leftTitle}>Artisans</Text>
                  <View style={styles.leftDivider} />
                  <Text style={styles.leftSub}>
                    Manage your products, show your brand, and grow your
                    local presence.
                  </Text>
                </View>
              </View>
            )}
            {/* ── RIGHT FORM ── */}
            <View
              style={[
                styles.formContainer,
                { paddingTop: isMobile ? 36 : 44 },
              ]}
            >

              {/* Header */}
              <View style={styles.formHeader}>
                <View style={styles.formBadge}>
                  <Ionicons name="business-outline" size={14} color="#5177b0" />
                  <Text style={styles.formBadgeText}>Artisan Account</Text>
                </View>
                <Text style={styles.formTitle}>Sign In</Text>
                <Text style={styles.formSubtitle}>
                  Enter your credentials to continue
                </Text>
              </View>

              {/* EMAIL FIELD */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email Address<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
                <View
                  style={[
                    styles.inputWrapper,
                    emailFocused && styles.inputWrapperFocused,
                    errors.email && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={
                      errors.email
                        ? "#ef4444"
                        : emailFocused
                        ? "#5177b0"
                        : "#9ca3af"
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="#c0c8d4"
                    value={email}
                    maxLength={64}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onChangeText={(text) => {
                      setEmail(text);
                      const error = validateField("email", text);
                      setErrors((prev) => ({ ...prev, email: error }));
                    }}
                    style={styles.textInput}
                  />
                </View>
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* PASSWORD FIELD */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Password<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
                <View
                  style={[
                    styles.inputWrapper,
                    passwordFocused && styles.inputWrapperFocused,
                    errors.password && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={
                      errors.password
                        ? "#ef4444"
                        : passwordFocused
                        ? "#5177b0"
                        : "#9ca3af"
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#c0c8d4"
                    secureTextEntry
                    maxLength={64}
                    value={password}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChangeText={(text) => {
                      setPassword(text);
                      const error = validateField("password", text);
                      setErrors((prev) => ({ ...prev, password: error }));
                    }}
                    style={styles.textInput}
                  />
                </View>
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              {/* LOGIN BUTTON */}
              <Pressable
                onHoverIn={() => setHoveredScan(true)}
                onHoverOut={() => setHoveredScan(false)}
                onPress={handleBusinessLogin}
                disabled={isLoading}
                style={[
                  styles.loginButton,
                  hoveredScan && styles.loginButtonHovered,
                ]}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </Pressable>

              {/* SIGN UP LINK */}
              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <Text
                  style={styles.signupLink}
                  onPress={() => router.push("/businessRegistration")}
                >
                  Create one
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* LOADING OVERLAY */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#5177b0" />
              <Text style={styles.loadingText}>Signing in…</Text>
            </View>
          </View>
        )}
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    backgroundColor: "#f0f4fa",
  },

  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(224, 232, 245, 0.55)",
  },

  loginCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#cae2f3",
    alignSelf: "center",
    shadowColor: "#3a5a8a",
    shadowOpacity: 0.14,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  leftPanel: {
    width: 300,
    backgroundColor: "#1e3a5f",
    padding: 36,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(81,119,176,0.25)",
    top: -60,
    left: -60,
  },
  decorCircle2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -40,
    right: -40,
  },
  leftContent: {
    zIndex: 2,
  },
  leftTagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Montserrat-Regular",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  leftTitle: {
    fontSize: 30,
    color: "#ffffff",
    fontFamily: "Garet-Heavy",
    lineHeight: 36,
    marginBottom: 16,
  },
  leftDivider: {
    width: 36,
    height: 3,
    backgroundColor: "#5177b0",
    borderRadius: 2,
    marginBottom: 16,
  },
  leftSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Montserrat-Regular",
    lineHeight: 20,
    marginBottom: 28,
  },
  leftImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    opacity: 0.9,
  },

  mobileIllustration: {
    width: "70%",
    height: 160,
    alignSelf: "center",
    marginBottom: 16,
    opacity: 0.85,
  },

  formContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 36,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },

  formHeader: {
    marginBottom: 28,
  },
  formBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(81,119,176,0.09)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  formBadgeText: {
    fontSize: 11,
    color: "#5177b0",
    fontFamily: "Montserrat-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  formTitle: {
    fontSize: 26,
    fontFamily: "Garet-Heavy",
    color: "#0f1f38",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: "#8a96a8",
    fontFamily: "Montserrat-Regular",
  },

  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
    color: "#4b5563",
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: "#5177b0",
    backgroundColor: "#f0f5ff",
    shadowColor: "#5177b0",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5",
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#1a2f4a",
    height: "100%",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 11,
    fontFamily: "Montserrat-Regular",
    marginTop: 5,
    alignSelf: "flex-end",
  },

  loginButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#5177b0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#5177b0",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    cursor: "pointer",
  },
  loginButtonHovered: {
    backgroundColor: "#1e3a5f",
    shadowOpacity: 0.45,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
    letterSpacing: 0.4,
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 13,
    color: "#8a96a8",
    fontFamily: "Montserrat-Regular",
  },
  signupLink: {
    fontSize: 13,
    color: "#5177b0",
    fontFamily: "Montserrat-Bold",
  },

  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,31,56,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4b5563",
    fontFamily: "Montserrat-Regular",
  },
});