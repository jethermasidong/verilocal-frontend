import { Slot } from "expo-router";
import { View } from "react-native";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function HomeLayout() {
  return (
    <>
      <Navbar 
        links={[
          { name: "HOME", route: "/" },
          { name: "ABOUT", route: "/aboutme" },
          { name: "CONTACT", route: "/contact" },
          { name: "JOIN US", route: "/login-business" },
        ]}
      />
      {/* Spacer to prevent content overlap */}
      <View style={{ height: 70, }} />
      

      <Slot />

      <Footer />
    </>
  );
}
