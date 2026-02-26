import axios from "axios";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import qs from "qs";
import { useEffect, useRef, useState } from "react";
import BackButton from "../../components/BackButton";
import {
  ActivityIndicator, Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
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

  const [ hoveredScan, setHoveredScan ] = useState(false)


  useEffect(() => {
    const handleResize = () =>
      setIsMobile(Dimensions.get("window").width < 600);
    handleResize();
    Dimensions.addEventListener("change", handleResize);
    return () => Dimensions.removeEventListener("change", handleResize);
  }, []);

  const handleBusinessLogin = async () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required!";
    if (!password) newErrors.password = "Password is required!";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/login",
        qs.stringify({ email, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      Alert.alert("OTP Sent", "Check your email for OTP");
      router.push({
        pathname: "/otp",
        params: {email}
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
        style={{
          flex: 1,
          backgroundColor: "rgba(255,255,255,0.85)", 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
      <ImageBackground
          source={bgImage} 
          style={{flex: 1, width: '100%', height: '100%',}}
          imageStyle={{ opacity: 0.3}}
          resizeMode="cover"
        >
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
        <BackButton />
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              backgroundColor: "#E3E3E3",
              borderRadius: 20,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 5 },
              elevation: 6,
              width: "100%",
              maxWidth: 800,
            }}
          >
            {/* LEFT IMAGE */}
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  borderRadius: 20,
                  width: "100%",
                  minHeight: isMobile ? 280 : "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  elevation: 3,
                }}
              >
                <Image
                  source={require("../../assets/images/login.png")}
                  style={{
                    width: isMobile ? 460 : 360,
                    height: isMobile ? 290 : 380,
                    borderRadius: 20,
                  }}
                  resizeMode="wrap"
                />
              </View>
            </View>

            {/* RIGHT FORM */}
            <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Montserrat-Regular",
                  fontWeight: 'bold',
                  color: "#000",
                  marginBottom: 20,
                }}
              >
                Business Login
              </Text>

              {/* EMAIL */}
              <Text style={{ fontSize: 13, marginBottom: 5, fontFamily: 'Montserrat-Regular' }}>
                Email*
              </Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors((prev) => ({ ...prev, email: null }));
                }}
                style={{
                  borderWidth: 1,
                  fontFamily: 'Montserrat-Regular',
                  fontSize: 13,
                  borderColor: errors.email ? "#ff4d4d" : "#000",
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  paddingHorizontal: 15,
                  height: 44,
                  marginBottom: 5,
                }}
              />
              {errors.email && (
                <Text style={{ color: "#ff4d4d", fontSize: 10, fontFamily: 'Montserrat-Regular', alignSelf: 'flex-end'}}>
                  {errors.email}
                </Text>
              )}

              {/* PASSWORD */}
              <Text style={{ fontSize: 13, marginBottom: 5, fontFamily: 'Montserrat-Regular' }}>
                Password*
              </Text>
              <TextInput
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: null }));
                }}
                style={{
                  borderWidth: 1,
                  borderColor: errors.password ? "#ff4d4d" : "#000",
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: 'Montserrat-Regular',
                  backgroundColor: "#fff",
                  paddingHorizontal: 15,
                  height: 44,
                  marginBottom: 5,
                }}
              />
              {errors.password && (
                <Text style={{ color: "#ff4d4d", fontSize: 10, fontFamily: 'Montserrat-Regular', alignSelf: 'flex-end' }}>
                  {errors.password}
                </Text>
              )}

              {/* LOGIN BUTTON */}
              <Pressable
                onHoverIn={() => setHoveredScan(true)}
                onHoverOut={() => setHoveredScan(false)}
                onPress={handleBusinessLogin}
                disabled={isLoading}
                style={{
                  backgroundColor: hoveredScan ? "#000000" : "#5177b0",
                  height: 40,
                  borderRadius: 25,
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 15,
                  width: "40%",
                  alignSelf: "center",
                  shadowColor: "#000000",
                  shadowOpacity: 0.5,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 3,
                  cursor: "pointer",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 14, fontFamily: 'Montserrat-Regular' }}>
                  Login
                </Text>
              </Pressable>

              {/* SIGN UP */}
              <Text style={{ textAlign: "center", fontSize: 13, fontFamily: 'Montserrat-Regular' }}>
                Don’t have an account?{" "}
                <Text
                  style={{ color: "#4A70A9", fontWeight: "bold" }}
                  onPress={() =>
                    router.push("/businessRegistration")
                  }
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
          {isLoading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#5177b0" />
                <Text style={{ marginTop: 10 }}>Logging in...</Text>
              </View>
            </View>
          )}
        </ScrollView>
        </ImageBackground>
      </Animated.View>
  );
}
