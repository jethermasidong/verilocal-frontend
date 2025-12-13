import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import qs from "qs";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

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

  useEffect(() => {
    const handleResize = () => setIsMobile(Dimensions.get("window").width < 600);
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

    const ADMIN_EMAIL = "admin@verilokal.com";
    const ADMIN_PASSWORD = "verilokal@2025";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      await AsyncStorage.setItem("isAdmin", "true");
      Alert.alert("Success", "Admin login successful!");
      router.replace("/admin/dashboard");
      return; 
    }
///"https://backend1-al4l.onrender.com
    try {
      const response = await axios.post(
        "https://backend1-al4l.onrender.com/api/login",
        qs.stringify({ email, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { token, business } = response.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("business_id", business.id.toString());
      await AsyncStorage.setItem("name", business.name);
      await AsyncStorage.setItem("registered_business_name", business.registered_business_name);
      Alert.alert("Success", "Business login successful!");
      router.replace("/business");

    } catch (error) {
      if (error.response?.status === 404) {
        setErrors({ email: " ", password: "Incorrect Username or Password" });
      } else if (error.response?.status === 403) {
        setErrors({ email: " ", password: "Business not verified yet!" });
      } else {
        setErrors({ email: "Invalid Login", password: "Invalid Login" });
      }
    }
  };

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
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
        {/* Left Box */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              paddingVertical: 20,
              paddingHorizontal: 20,
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
                width: isMobile ? 220 : 350,
                height: isMobile ? 220 : 350,
                marginBottom: 20
              }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Right Form */}
        <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
          <Text style={{
            fontSize: 25,
            fontWeight: "500",
            fontFamily: "Montserrat-Bold",
            color: "#000",
            marginBottom: isMobile ? 10 : 20
          }}>
            LOGIN
          </Text>

          {/* Email */}
          <Text style={{ fontSize: 12, marginBottom: 5, fontFamily: "Montserrat-Regular" }}>Email*</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: null }));
            }}
            style={{
              borderWidth: 1,
              borderColor: errors.email ? "#ff4d4d" : "#000",
              borderRadius: 10,
              backgroundColor: "#ffffffff",
              paddingVertical: isMobile ? 12 : 14,
              paddingHorizontal: 15,
              marginBottom: errors.email ? 4 : 15,
              fontFamily: "Montserrat-Regular",
              fontSize: isMobile ? 10 : 12,
              height: 44
            }}
          />
          {errors.email && <Text style={{ color: "#ff4d4d", fontSize: 12, marginBottom: 10 }}>{errors.email}</Text>}

          {/* Password */}
          <Text style={{ fontSize: 12, marginBottom: 5, fontFamily: "Montserrat-Regular" }}>Password*</Text>
          <TextInput
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: null }));
            }}
            style={{
              borderWidth: 1,
              borderColor: errors.password ? "#ff4d4d" : "#000",
              borderRadius: 10,
              backgroundColor: "#ffffffff",
              paddingVertical: isMobile ? 12 : 14,
              paddingHorizontal: 15,
              marginBottom: errors.password ? 4 : 20,
              fontFamily: "Montserrat-Regular",
              fontSize: isMobile ? 10 : 12,
              height: 44
            }}
          />
          {errors.password && <Text style={{ color: "#ff4d4d", fontSize: 12, marginBottom: 10 }}>{errors.password}</Text>}

          {/* Login Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#4A70A9",
              paddingVertical: 10,
              borderRadius: 25,
              alignItems: "center",
              marginBottom: 20,
              marginTop: 10,
              width: "60%",
              alignSelf: "center",
              height: 44,
              borderWidth: 1
            }}
            onPress={handleBusinessLogin}
          >
            <Text style={{
              color: "#fff",
              fontWeight: "600",
              fontSize: isMobile ? 13 : 16
            }}>
              Login
            </Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <Text style={{
            textAlign: "center",
            fontFamily: "Montserrat-Regular",
            fontSize: isMobile ? 11 : 13
          }}>
            Don’t have an account?{" "}
            <Text
              style={{ color: "#4A70A9", fontFamily: "Montserrat-Bold" }}
              onPress={() => router.push("/business/businessRegistration")}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
