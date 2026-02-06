import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View, } from "react-native";

export default function LoginButtons() {
  
  const router = useRouter();
  const [ hoveredJoin, setHoveredJoin ] = useState(false);
  const [ hoveredScan, setHoveredScan ] = useState(false)
  const [fontsLoaded] = useFonts({
      "Garet-Book": require("../assets/fonts/garet/Garet-Book.ttf"),
      "Garet-Heavy": require("../assets/fonts/garet/Garet-Heavy.ttf"),
      "Montserrat-Regular": require("../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    });
  
     if (!fontsLoaded) {
      return <View><Text>Loading fonts...</Text></View>;
    }

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 30,
        marginTop: 10,
      }}
    >
      {/* Continue as Buyer */}
      <Pressable
        onHoverIn={() => setHoveredScan(true)}
        onHoverOut={() => setHoveredScan(false)}
        onPress={() => router.push("/buyer/qrscanner")}
        style={{
          backgroundColor: hoveredScan ? "#a7a5a5" : "#ffffff",
          paddingVertical: 12,
          paddingHorizontal: 54,
          borderRadius: 50,
          borderWidth: 1.3,
          shadowColor: "#000000",
          shadowOpacity: 0.5,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 3,
          cursor: "pointer",
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontSize: 16,
            fontWeight:"bold",
            fontFamily: "Garet-Book",
          }}
        >
          Scan
        </Text>
      </Pressable>
      

      {/* Login as Business */}
      <Pressable
        onHoverIn={() => setHoveredJoin(true)}
        onHoverOut={() => setHoveredJoin(false)}
        onPress={() => router.push("/login-business")}
        style={{
          backgroundColor: hoveredJoin ? "#a7a5a5" : "#ffffff",
          paddingVertical: 12,
          paddingHorizontal: 45,
          borderRadius: 50,
          borderWidth: 1.3,
          shadowColor: "#000000",
          shadowOpacity: 0.5,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 3,
          cursor: "pointer",
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontSize: 16,
            fontWeight: "bold",
            fontFamily: "Garet-Book",
          }}
        >
          Join us
        </Text>
      </Pressable>
    </View>

    
  );
}
