import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import qs from "qs";
import { useEffect, useState } from "react";
import { Alert, Dimensions, Image, Text, TextInput, TouchableOpacity, View } from "react-native";

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

    try {
      // ---------- ADMIN LOGIN ----------
      const adminRes = await axios.post(
        "https://backend1-al4l.onrender.com/api/admin/login",
        qs.stringify({ email, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (adminRes.data.admin) {
        await AsyncStorage.setItem("token", adminRes.data.token);
        Alert.alert("Success", "Admin login successful!");
        router.replace("/admin"); // redirect to admin dashboard
        return;
      }
    } catch (adminErr) {
      // Admin login failed, continue to business login
    }

    try {
      // ---------- BUSINESS LOGIN ----------
      const response = await axios.post(
        "https://backend1-al4l.onrender.com/api/login",
        qs.stringify({ email, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      await AsyncStorage.setItem("token", response.data.token);
      Alert.alert("Success", "Business login successful!");
      router.replace("/business"); // redirect to business dashboard
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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#DDDADF",
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
        {/* Left: Logo + Welcome Text */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              paddingVertical: 20,
              paddingHorizontal: 20,
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <Image source={require("../../assets/images/verilokal_logo.png")} style={{ width: isMobile ? 80: 120, height:isMobile ? 100 : 150, marginBottom: 20 }} />
            <Text style={{ fontSize:isMobile ? 22: 28, fontWeight: "570", color: "#000", textAlign: "center", fontFamily: "Montserrat-Regular" }}>
              Welcome{"\n"}to{"\n"}
              <Text style={{ color: "#b04224", fontWeight: "800", fontFamily: "Montserrat-Bold" }}>VeriLocal</Text>
            </Text>
          </View>
        </View>

        {/* Right: Login Form */}
        <View style={{ flex: 1, padding: 20, justifyContent: "center", marginLeft: isMobile ? -25: 0 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", fontFamily: "Montserrat-Bold", color: "#000", marginBottom: isMobile ? 10: 20 }}>Login</Text>

          {/* Email */}
          <Text style={{ fontSize: 10, marginBottom: 5, fontFamily: "Montserrat-Regular" }}>Email*</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => { setEmail(text); setErrors(prev => ({ ...prev, email: null })); }}
            style={{
              borderWidth: 1,
              borderColor: errors.email ? "#ff4d4d" : "#000",
              borderRadius: 18,
              backgroundColor: "#ffffff",
              paddingVertical: 10,
              paddingHorizontal: 15,
              marginBottom: errors.email ? 4 : 15,
              fontFamily: "Montserrat-Regular",
              fontSize: isMobile ? 9.5: 12,
            }}
          />
          {errors.email && <Text style={{ color: "#ff4d4d", fontSize: 12, marginBottom: 10 }}>{errors.email}</Text>}

          {/* Password */}
          <Text style={{ fontSize: 10, marginBottom: 5, fontFamily: "Montserrat-Regular" }}>Password*</Text>
          <TextInput
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setErrors(prev => ({ ...prev, password: null })); }}
            style={{
              borderWidth: 1,
              borderColor: errors.password ? "#ff4d4d" : "#000",
              borderRadius: 18,
              backgroundColor: "#ffffff",
              paddingVertical: 10,
              paddingHorizontal: 15,
              marginBottom: errors.password ? 4 : 20,
              fontFamily: "Montserrat-Regular",
              fontSize: isMobile ? 9.5: 12,
            }}
          />
          {errors.password && <Text style={{ color: "#ff4d4d", fontSize: 12, marginBottom: 10 }}>{errors.password}</Text>}

          {/* Login Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#e98669",
              paddingVertical: isMobile ? 8 :12,
              borderRadius: 20,
              alignItems: "center",
              marginBottom: 10,
              width: "40%",
              alignSelf: "center",
              height: 35,
            }}
            onPress={handleBusinessLogin} // <-- handles both admin & business login
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: isMobile ? 13: 16, top: isMobile ? 0: -6 }}>Login</Text>
          </TouchableOpacity>

          {/* Sign Up Text */}
          <Text style={{ textAlign: "center", fontFamily: "Montserrat-Regular", fontSize: isMobile ? 13: 16 }}>
            Don’t have an account?{" "}
            <Text style={{ color: "#b04224", fontFamily: "Montserrat-Bold" }} onPress={() => router.push("/business/businessRegistration")}>
              Sign up
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
