import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  Animated,
} from "react-native";

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const inputRef = useRef(null);

  /* Cursor blink animation */
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const verifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      return Alert.alert("Please enter the 6-digit OTP");
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/verify-otp",
        { email, otp }
      );

      const { token, business } = response.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("business_id", business.id.toString());
      await AsyncStorage.setItem("name", business.name);

      const ADMIN_EMAIL = 'verilocalphi@gmail.com'
      if (email.toLowerCase() === ADMIN_EMAIL) {
        await AsyncStorage.setItem("isAdmin", "true");
        Alert.alert("Admin Login Success!");
        router.replace("/admin/dashboard");
      } else {
        await AsyncStorage.removeItem("isAdmin");
        Alert.alert("Login success");
        router.replace("/business");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert(
        error.response?.data?.message || "Invalid or expired OTP"
      );
    }
  };

  const resendOtp = async () => {
    try {
      await axios.post("http://localhost:3000/api/resend-otp", { email });
      Alert.alert("OTP resent");
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error resending OTP");
    }
  };

  useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          padding: 30,
          backgroundColor: "#ffffff",
          borderRadius: 20,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 7 },
          elevation: 6,
          width: "100%",
          height: "100%",
          maxWidth: 400,
          maxHeight: 450,
        }}
      >
        <Text
          style={{
            fontSize: 40,
            fontWeight: "700",
            fontFamily: "Montserrat-Regular",
            marginBottom: 5,
          }}
        >
          OTP Verification
        </Text>

        <Text
          style={{
            fontSize: 15,
            marginBottom: 40,
            fontFamily: "Montserrat-Regular",
            color: "#555",
          }}
        >
          Please enter the OTP (One-Time Password) sent to your registered email address ({email}) to complete your verifcation.
        </Text>

        {/* Hidden Input */}
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={(text) => {
            if (/^\d*$/.test(text) && text.length <= OTP_LENGTH) {
              setOtp(text);
            }
          }}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
          style={{ position: "absolute", opacity: 0 }}
        />

        {/* OTP Boxes with Cursor Indicator */}
        <Pressable
          onPress={() => inputRef.current.focus()}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const isActive = index === otp.length && otp.length < OTP_LENGTH;
            const isFilled = Boolean(otp[index]);

            return (
              <View
                key={index}
                style={{
                  width: 52,
                  height: 60,
                  borderWidth: 1.5,
                  borderRadius: 10,
                  borderColor: isActive
                    ? "#5177b0"
                    : isFilled
                    ? "#5177b0"
                    : "#ccc",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isActive ? (
                  <Animated.View
                    style={{
                      width: 2,
                      height: 24,
                      backgroundColor: "#5177b0",
                      opacity: blinkAnim,
                    }}
                  />
                ) : (
                  <Text style={{ fontSize: 22, fontWeight: "600" }}>
                    {otp[index] || ""}
                  </Text>
                )}
              </View>
            );
          })}
        </Pressable>

        {/* Verify Button */}
        <Pressable
          onPress={verifyOtp}
          disabled={otp.length !== OTP_LENGTH}
          style={{
            backgroundColor:
              otp.length === OTP_LENGTH ? "#5177b0" : "#aaa",
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Verify OTP
          </Text>
        </Pressable>

        {/* Resend */}
        <Pressable onPress={resendOtp}>
          <Text style={{ textAlign: "center", color: "blue" }}>
            Resend OTP
          </Text>
        </Pressable>
        <Text
          style={{
            fontSize: 12,
            marginVertical: 30,
            fontFamily: "Montserrat-Regular",
            color: "#555",
          }}
        >
          The OTP (One-Time Password) will expire in 5 minutes of activation.
        </Text>
      </View>
    </View>
  );
}
