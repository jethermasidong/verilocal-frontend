import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import BackButton from "../../components/BackButton";

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const inputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

 
  const blinkAnim = useRef(new Animated.Value(1)).current;

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const triggerShake = () => {
    shakeAnim.setValue(0);

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

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

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://verilocalph.onrender.com/api/verify-otp",
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
        console.log("OTP ERROR:", error.response?.data || error.message);

        setIsOtpError(true);
        setErrorMessage(
          error.response?.data?.message || "Invalid or expired OTP"
        );

        triggerShake();
    } finally {
        setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await axios.post("https://verilocalph.onrender.com/api/resend-otp", { email });
      Alert.alert("OTP resent");
    } catch (error) {
      console.error(error.response?.data || error.message);

      setIsOtpError(true);
      setErrorMessage(
        error.response?.data?.message || "Invalid or expired OTP"
      );
    }
  };


  const [errorMessage, setErrorMessage] = useState("");
  const [isOtpError, setIsOtpError] = useState(false);

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
    <BackButton />
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
              if (isOtpError) {
                setIsOtpError(false);
                setErrorMessage("");
              }
            }
          }}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
          style={{ position: "absolute", opacity: 0 }}
        />

        {/* OTP Boxes with Cursor Indicator */}
        <Animated.View style={{ marginBottom: 10, position: "relative", transform: [{ translateX: shakeAnim }], }}>
          <Pressable
            onPress={() => inputRef.current.focus()}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
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
                    borderColor: isOtpError
                      ? "#ff3b30"
                      : isActive
                      ? "#5177b0"
                      : isFilled
                      ? "#5177b0"
                      : "#ccc",
                    overflow: "hidden",
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

            {isOtpError && (
            <Text
              style={{
                color: "#ff3b30",
                marginVertical: 6,
                textAlign: "center",
                fontSize: 12,
              }}
            >
              {errorMessage}
            </Text>
          )}
        </Animated.View>

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
    </View>
  );
}
