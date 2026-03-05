import { Pressable, Text, useWindowDimensions } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";

export default function BackButton({ color = "#111", size = 20 }) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const [hoverBack, setHoverBack] = useState(false);

  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  });

  // Hide button on mobile
  if (isMobile) {
    return null;
  }

  return (
    <Pressable
      onHoverIn={() => setHoverBack(true)}
      onHoverOut={() => setHoverBack(false)}
      onPress={() => router.back()}
      style={{
        backgroundColor: hoverBack ? "#bbb" : "transparent",
        borderColor: "#000",
        borderWidth: 1,
        borderRadius: 50,
        paddingVertical: 6,
        paddingHorizontal: 10,
        flexDirection: "row",
        position: "absolute",
        top: 12,
        left: 40,
        zIndex: 10,
      }}
      hitSlop={10}
    >
      <Ionicons name="chevron-back-outline" size={size} color={color} />
      <Text
        style={{
          color,
          marginHorizontal: 2,
          fontSize: size * 0.8,
          fontFamily: "Montserrat-Regular",
          alignContent: "center",
        }}
      >
        Back
      </Text>
    </Pressable>
  );
}