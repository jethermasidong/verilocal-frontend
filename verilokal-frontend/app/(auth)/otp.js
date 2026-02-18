import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function OtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    if (!otp) return Alert.alert("Enter OTP");

    try {
      const response = await axios.post("http://localhost:3000/api/verify-otp", { email, otp });

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
      Alert.alert(error.response?.data?.message || "Invalid or expired OTP");
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

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Enter OTP sent to {email}
      </Text>

      <TextInput
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          padding: 15,
          borderRadius: 10,
          marginBottom: 20
        }}
      />

      <Pressable
        onPress={verifyOtp}
        style={{
          backgroundColor: "#5177b0",
          padding: 15,
          borderRadius: 10,
          marginBottom: 10
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Verify OTP
        </Text>
      </Pressable>

      <Pressable onPress={resendOtp}>
        <Text style={{ textAlign: "center", color: "blue" }}>
          Resend OTP
        </Text>
      </Pressable>
    </View>
  );
}
