import { useFonts } from "expo-font";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import LoginButtons from "../components/LoginButtons";

export default function Home() {
  const { height, width } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../assets/fonts/garet/Garet-Heavy.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 30,
            paddingTop: 50,
            paddingBottom: 100,
          }}
        >
          {/* Logo */}
          <Image
            source={require("../assets/images/verilokal_logo.png")}
            style={{
              width: width < 500 ? 120 : 160,
              height: width < 500 ? 150 : 200,
              marginBottom: 25,
            }}
          />

          {/* Headlines */}
          <Text
            style={{
              fontSize: width < 500 ? 35 : 65,
              fontFamily: "Garet-Book",
              fontWeight: "bold",
              textAlign: "center",
              color: "#000000",
            }}
          >
            Preserving what is
          </Text>

          <Text
            style={{
              fontSize: width < 500 ? 35 : 65,
              fontFamily: "Garet-Heavy",
              textAlign: "center",
              color: "#d6461f",
              marginBottom: 15,
            }}
          >
            TRUE,
          </Text>

          <Text
            style={{
              fontSize: width < 500 ? 35 : 65,
              fontFamily: "Garet-Book",
              fontWeight: "bold",
              textAlign: "center",
              color: "#000000",
            }}
          >
            Empowering what
          </Text>

          <Text
            style={{
              fontSize: width < 500 ? 35 : 65,
              fontFamily: "Garet-Book",
              fontWeight: "bold",
              textAlign: "center",
              color: "#000000",
              marginBottom: 15,
            }}
          >
            is{" "}
            <Text
              style={{
                fontFamily: "Garet-Heavy",
                fontSize: width < 500 ? 35 : 65,
                color: "#d6461f",
              }}
            >
              OURS.
            </Text>
          </Text>

          {/* Subtext */}
          <Text
            style={{
              fontSize: width < 500 ? 16 : 20,
              fontFamily: "Garet-Book",
              textAlign: "center",
              color: "#000000",
              maxWidth: 600,
              lineHeight: width < 500 ? 24 : 28,
              marginBottom: 20,
            }}
          >
            Ensuring genuine Filipino craftsmanship through secure QR
            verification and blockchain technology.
          </Text>

          {/* Login Buttons */}
          <LoginButtons />
        </ScrollView>
      </SafeAreaView>
  );
}
